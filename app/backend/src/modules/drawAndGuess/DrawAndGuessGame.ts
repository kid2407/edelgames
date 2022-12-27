import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleRoomApi, {EventDataObject} from "../../framework/modules/ModuleRoomApi";
import User from "../../framework/User";
import drawAndGuess from "./DrawAndGuess";
import {clearTimeout} from "timers";

enum gameStates {
    WORD_SELECTION = 'selecting',
    DRAWING = 'drawing',
    FINISHED = 'finished',
    PREPARING_TURN = 'PREPARING_TURN'
}


export default class DrawAndGuessGame implements ModuleGameInterface {

    // misc variables
    roomApi: ModuleRoomApi = null;
    activePlayerIndex: number = 0;
    activePlayer: User = undefined; //
    activeGameState: gameStates = gameStates.WORD_SELECTION; // what the server is currently doing
    round: number = 0;
    scoreboard: {[key: string]: number} = {};

    // configuration
    msUntilWordSelectionTimeout: number =       1000 * 10; // 10 sec -> the time for the active player to choose a word
    msUntilDrawingTimeout: number =             1000 * 60; // 60 sec -> the time for the players to draw and guess
    msUntilNextWordSelectionTimeout: number =   1000 * 15; // 15 sec -> the time for the players to see the solution
    maxHintsThreshold: number = 0.75; // the maximum percentage of hints, that will be given
    roundsToPlay: 10;

    // dynamic variables for active use -> do not change default value
    msToNextHint = 0;
    hintsTimer: NodeJS.Timeout = null;
    wordSelectionTimer: NodeJS.Timeout = null;
    wordDrawingTimer: NodeJS.Timeout = null;
    drawingTimerTimestamp: number = 0;
    activeWord: string = undefined; // the current word, that has to be guessed
    activeWordMask: string = undefined; // defines, what the players are allowed to see
    availableWords: string[] = ['you should', 'not see', 'this list'];
    playersWithCorrectGuess: {playerId: string, timing: number}[] = [];


    onGameInitialize(roomApi: ModuleRoomApi): void {
        this.roomApi = roomApi;
        this.roomApi.addEventHandler('activeCanvasChanged', this.onActiveCanvasChanged.bind(this));
        this.roomApi.addEventHandler('activeWordChosen', this.onActiveWordChosen.bind(this));
        this.roomApi.addEventHandler('attemptGuess', this.onAttemptGuess.bind(this));
        this.roomApi.addUserLeaveHandler(this.onUserLeaveHandler.bind(this));

        this.updateActivePlayer();
    }

    updateActivePlayer(stepToNextPlayer: boolean = false): void {
        let roomMembers = this.roomApi.getRoomMembers();

        if(stepToNextPlayer) {
            this.activePlayerIndex++;
        }

        this.activePlayerIndex %= roomMembers.length;
        if(stepToNextPlayer && this.activePlayerIndex === 0) {
            this.round++;

            if(this.round > this.roundsToPlay) {
                // todo finish the game instead of continuing the next round
                this.activeGameState = gameStates.FINISHED;
            }
        }

        let previousActivePlayer = this.activePlayer;
        this.activePlayer = roomMembers[this.activePlayerIndex];

        if(previousActivePlayer !== this.activePlayer) {
            this.activeGameState = gameStates.WORD_SELECTION;

            if(this.hintsTimer) {
                clearTimeout(this.hintsTimer);
            }

            // active player has changed -> notify players
            this.roomApi.sendRoomMessage('activePlayerChanged', {
                activePlayer: this.activePlayer.getId()
            });

            this.selectNewWordOptions();
            this.roomApi.sendPlayerMessage(this.activePlayer.getId(), 'wordSelectionOptions', {
                options: this.availableWords
            })

            // start the timer for the word selection
            if(this.wordSelectionTimer) {
                clearTimeout(this.wordSelectionTimer);
            }
            this.wordSelectionTimer = setTimeout(this.onWordSelectionTimeout.bind(this), this.msUntilWordSelectionTimeout);
        }
    }

    selectNewWordOptions(): void {
        let wordList = drawAndGuess.getWordList();
        this.availableWords = [];
        for(let i = 0; i < 3; i++) {
            this.availableWords.push(wordList[Math.floor(Math.random() * wordList.length)]);
        }
    }

    createWordMask(resetWordMask: boolean = true, addVisibleCharacters: number = 0): {total: number, masked: number} {
        if(resetWordMask || !this.activeWordMask || this.activeWordMask.length !== this.activeWord.length) {
            this.activeWordMask = '_'.repeat(this.activeWord.length);
        }

        let newWordMask = '';
        let hiddenCharacterIndices = [];
        let totalCharacters = 0;
        const ignoredChars = [' ', '-', ',', '!'];

        for(let i = 0; i < this.activeWord.length; i++) {
            let char = this.activeWord.charAt(i);

            if(ignoredChars.indexOf(char) !== -1) {
                // ignored chars are always visible
                newWordMask += char;
            }
            else if(!resetWordMask && this.activeWordMask.charAt(i) !== '_') {
                // if the previous mask had this character already visible, let it stay visible
                newWordMask += char;
                totalCharacters++;
            }
            else {
                // every hidden character gets replaced by an underscore
                newWordMask += '_';
                totalCharacters++;
                hiddenCharacterIndices.push(i);
            }
        }

        hiddenCharacterIndices = hiddenCharacterIndices.sort((/*a,b*/) => 0.5 - Math.random());
        // show new characters
        for(let c = 0; c < addVisibleCharacters; c++) {
            if(hiddenCharacterIndices.length) {
                let rI = hiddenCharacterIndices.shift();
                newWordMask = newWordMask.substring(0, rI) + this.activeWord.charAt(rI) + newWordMask.substring(rI+1)
            }
        }

        this.activeWordMask = newWordMask;
        return {
            total: totalCharacters,
            masked: hiddenCharacterIndices.length
        };
    }

    onActiveCanvasChanged(eventData: { [key: string]: any }) {
        if(this.activePlayer && this.activePlayer.getId() === eventData.senderId) {
            // only the active player can draw and send
            this.roomApi.sendRoomMessage('passiveCanvasChanged', eventData.canvasChangedEvent);
        }
    }

    // automatically decide for one of the available words, if the player does not answer fast enough
    onWordSelectionTimeout(): void {
        this.onActiveWordChosen({
            senderId: this.activePlayer.getId(),
            selection: this.availableWords[Math.floor(Math.random()*this.availableWords.length)]
        });
        this.wordSelectionTimer = null;
    }

    onActiveWordChosen(eventData: { [key: string]: any }): void {
        if( this.activeGameState === gameStates.WORD_SELECTION &&
            this.activePlayer && this.activePlayer.getId() === eventData.senderId)
        {
            let selectedWord = eventData.selection;
            if(this.availableWords.indexOf(selectedWord) !== -1) {
                // success
                this.activeWord = selectedWord;
                let maskData = this.createWordMask(true);
                this.activeGameState = gameStates.DRAWING;

                this.drawingTimerTimestamp = Date.now();

                // tell all players the wordmask
                this.roomApi.sendRoomMessage('wordToGuessChanged', {
                    mask: this.activeWordMask,
                    timeUntil: (this.drawingTimerTimestamp + this.msUntilDrawingTimeout)
                });

                // tell the painter the selected word
                this.roomApi.sendPlayerMessage(this.activePlayer.getId(), 'wordToDrawChanged', {
                    word: this.activeWord
                });

                if(this.wordDrawingTimer) {
                    clearTimeout(this.wordDrawingTimer);
                }
                this.wordDrawingTimer = setTimeout(this.onDrawingTimeout.bind(this), this.msUntilDrawingTimeout);

                // set timeout for showing hints to the players
                if(maskData.total && this.maxHintsThreshold) {
                    this.msToNextHint = (this.msUntilDrawingTimeout - 10000) / (maskData.total * this.maxHintsThreshold);
                    if(this.hintsTimer) {
                        clearTimeout(this.hintsTimer);
                    }
                    this.hintsTimer = setTimeout(this.onHintInterval.bind(this), this.msToNextHint);
                }
            }
            else {
                this.roomApi.sendPlayerBubble(eventData.senderId, 'Invalid selection!', 'error');
            }
        }
    }

    // when the drawing time is up
    onDrawingTimeout(): void {
        this.activeGameState = gameStates.PREPARING_TURN;

        let drawnMs = Date.now() - this.drawingTimerTimestamp;
        let drawnPct = drawnMs / this.msUntilDrawingTimeout;
        let guessPct = this.playersWithCorrectGuess.length / (this.roomApi.getRoomMembers().length-1);

        const optimalPoints = 100;

        let avgTiming = 0;
        for(let data of this.playersWithCorrectGuess) {
            let {playerId, timing} = data;

            // the earlier the guess, the more points, but the earlier the round ended, the fewer points
            //  -> a guesser wants to guess a hard word early
            let timingPct = timing / drawnMs;
            let points = optimalPoints * (1 / timingPct);
            this.scoreboard[playerId] += points;
            avgTiming += timing;
        }

        // the longer the game, the more points. But the less correct guesses, the fewer points
        //  -> a painter wants the players to guess as late and as much as possible

        avgTiming /= (this.playersWithCorrectGuess.length || 1);
        avgTiming /= drawnMs; // low value => easy drawing
        let painterPoints = optimalPoints * drawnPct * (2 * guessPct) * avgTiming;
        this.scoreboard[this.activePlayer.getId()] += painterPoints;

        this.roomApi.sendRoomMessage('drawingSolution', {
            solution: this.activeWord,
            scoreboard: this.scoreboard,
            totalScoreKey: Object.values(this.scoreboard).reduce((a,b) => a+b, 0) // the total sum of points for preventing unnecessary renders
        });

        if(this.hintsTimer) {
            clearTimeout(this.hintsTimer);
        }

        this.activeGameState = gameStates.WORD_SELECTION;
        this.activeWord = '';
        this.playersWithCorrectGuess = [];
        setTimeout(this.updateActivePlayer.bind(this, true), this.msUntilNextWordSelectionTimeout);
    }

    onHintInterval(): void {
        let maskData = this.createWordMask(false, 1);
        if(this.activeGameState === gameStates.DRAWING && maskData.masked/maskData.total <= this.maxHintsThreshold) {
            this.roomApi.sendRoomMessage('wordToGuessChanged', {
                mask: this.activeWordMask
            });

            if(maskData.total >= 0 && this.maxHintsThreshold >= 0) {
                this.hintsTimer = setTimeout(this.onHintInterval.bind(this), this.msToNextHint);
            }
        }
    }

    onUserLeaveHandler(eventData: EventDataObject): void {
        // if this user was active, skip to the next one
        if(eventData.removedUser === this.activePlayer) {
            this.updateActivePlayer(false);
        }
    }

    onAttemptGuess(eventData: EventDataObject): void {
        let {senderId, guess} = eventData;

        guess = guess.trim().toLowerCase();

        if( this.activeGameState === gameStates.DRAWING &&
            senderId !== this.activePlayer.getId() &&
            !this.playersWithCorrectGuess.find(el => el.playerId === senderId))
        {
            let roomMembers = this.roomApi.getRoomMembers();
            let now = Date.now();

            if(guess === this.activeWord) {
                this.playersWithCorrectGuess.push({
                    playerId: senderId,
                    timing: (now - this.drawingTimerTimestamp)
                });
                this.roomApi.sendRoomMessage('newGuessChatMessage', {
                    sender: senderId,
                    text: ' guessed the word!',
                    color: '#19bb19',
                    timestamp: now
                });

                if(this.playersWithCorrectGuess.length >= roomMembers.length-1) {
                    // all players guessed correctly! end the drawing phase!
                    if(this.wordDrawingTimer) {
                        clearTimeout(this.wordDrawingTimer);
                    }
                    this.onDrawingTimeout();
                }
            }
            else {
                this.roomApi.sendRoomMessage('newGuessChatMessage', {
                    sender: senderId,
                    text: guess,
                    color: null,
                    timestamp: now
                });
            }
        }
    }
}