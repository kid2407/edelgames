import React, {ReactNode} from "react";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleGameApi, {EventHandlerFunctionStack} from "../../framework/modules/ModuleGameApi";
import drawAndGuess from "./DrawAndGuess";
import DrawingCanvas, {
    canvasChangedEvent,
    drawingModes,
    eventTypes,
    predefinedColors
} from "../../framework/components/DrawingCanvas/DrawingCanvas";
import {EventDataObject} from "../../framework/util/EventManager";
import DrawingUtils from "./Components/DrawingUtils";
import ProfileManager from "../../framework/util/ProfileManager";
import RoomManager from "../../framework/util/RoomManager";
import User from "../../framework/util/User";
import ChatBox, {DAGChatMessage} from "./Components/ChatBox";
import GameStateBox from "./Components/GameStateBox";
import GameConfig, {GameConfigObject} from "./Components/GameConfig";
import WordSelection from "./Components/WordSelection";

interface IState {
    currentMode: string,
    currentColor: string,
    currentWeight: number,
    activePlayerId: string|undefined,
    lastWord: string|undefined,
    totalScoreKey: number,
    currentMask: string|null,
    currentWord: string|null,
    currentWordOptions: string[],
    timerUntil: number|null,
    currentGameState: string,
    defaultConfig: {[key: string]: any}|null,
}

export default class DrawAndGuessGame extends React.Component<{}, IState> implements ModuleGameInterface {

    private readonly gameApi: ModuleGameApi;
    private drawingCommandQueue: canvasChangedEvent[] = [];
    private scoreboard: {[key: string] : number} = {};
    private messageHistory: DAGChatMessage[] = [];

    eventHandlers: EventHandlerFunctionStack = {
        passiveCanvasChanged: this.onCanvasChangedRemote.bind(this),
        wordToGuessChanged: this.onWordToGuessChanged.bind(this),
        newGuessChatMessage: this.onNewGuessChatMessage.bind(this),
        activePlayerChanged: this.onActivePlayerChanged.bind(this),
        wordSelectionOptions: this.onWordSelectionOptions.bind(this),
        wordToDrawChanged: this.onWordToDrawChanged.bind(this),
        drawingSolution: this.onDrawingSolution.bind(this),
        gameStateChanged: this.onGameStateChanged.bind(this),
        configurationChanged: this.onRemoteConfigChanged.bind(this),
    }

    state = {
        currentMode: drawingModes.DRAW,
        currentColor: predefinedColors[0],
        currentWeight: 10,
        activePlayerId: undefined,
        lastWord: undefined,
        totalScoreKey: 0,
        currentMask: null,
        currentWord: null,
        currentWordOptions: [],
        timerUntil: null,
        currentGameState: 'configuration',
        defaultConfig: null
    };

    constructor(props: any) {
        super(props);
        this.gameApi = new ModuleGameApi(drawAndGuess, this);
    }

    // this method is called, once the component is ready and setState can be used
    componentDidMount(): void {
        this.gameApi.addEventHandler('passiveCanvasChanged', this.eventHandlers.passiveCanvasChanged);
        this.gameApi.addEventHandler('wordToGuessChanged', this.eventHandlers.wordToGuessChanged);
        this.gameApi.addEventHandler('newGuessChatMessage', this.eventHandlers.newGuessChatMessage);
        this.gameApi.addEventHandler('activePlayerChanged', this.eventHandlers.activePlayerChanged);
        this.gameApi.addEventHandler('wordSelectionOptions', this.eventHandlers.wordSelectionOptions);
        this.gameApi.addEventHandler('wordToDrawChanged', this.eventHandlers.wordToDrawChanged);
        this.gameApi.addEventHandler('drawingSolution', this.eventHandlers.drawingSolution);
        this.gameApi.addEventHandler('gameStateChanged', this.eventHandlers.gameStateChanged);
        this.gameApi.addEventHandler('configurationChanged', this.eventHandlers.configurationChanged);
    }

    componentWillUnmount() {
        this.gameApi.removeEventHandler('passiveCanvasChanged', this.eventHandlers.passiveCanvasChanged);
        this.gameApi.removeEventHandler('wordToGuessChanged', this.eventHandlers.wordToGuessChanged);
        this.gameApi.removeEventHandler('newGuessChatMessage', this.eventHandlers.newGuessChatMessage);
        this.gameApi.removeEventHandler('activePlayerChanged', this.eventHandlers.activePlayerChanged);
        this.gameApi.removeEventHandler('wordSelectionOptions', this.eventHandlers.wordSelectionOptions);
        this.gameApi.removeEventHandler('wordToDrawChanged', this.eventHandlers.wordToDrawChanged);
        this.gameApi.removeEventHandler('drawingSolution', this.eventHandlers.drawingSolution);
        this.gameApi.removeEventHandler('gameStateChanged', this.eventHandlers.gameStateChanged);
        this.gameApi.removeEventHandler('configurationChanged', this.eventHandlers.configurationChanged);
    }

    /* ====================== */
    /* Remote Event Listeners */
    /* ====================== */

    onRemoteConfigChanged(eventData: EventDataObject): void {
        let {configuration} = eventData;
        this.setState({
            defaultConfig: configuration
        });
    }

    onGameStateChanged(eventData: EventDataObject): void {
        let {gameState} = eventData; // either the string configuration or the string running

        this.setState({
            currentGameState: gameState
        });
    }

    onDrawingSolution(eventData: EventDataObject): void {
        let {solution, scoreboard, totalScoreKey} = eventData; // a string with the last word and the entire scoreboard to this point

        this.scoreboard = scoreboard as {[key: string]: number};

        this.addChatMessage(
            `Das Wort war: ${solution}`,
            null,
            null,
            'solution'
        );

        this.setState({
            lastWord: solution,
            totalScoreKey: totalScoreKey,
            currentWord: null,
            timerUntil: null,
            currentMask: null
        });
    }

    onWordToDrawChanged(eventData: EventDataObject): void {
        let {word} = eventData; // a string with the word, that should be drawn
        this.setState({
            currentWord: word
        });
    }

    onWordSelectionOptions(eventData: EventDataObject): void {
        let {options} = eventData; // an array of three strings
        this.setState({
            currentWordOptions: options
        });
    }

    onActivePlayerChanged(eventData: EventDataObject): void {
        let {activePlayer} = eventData; // the active player ID

        // clear canvas and delete old queued commands
        this.drawingCommandQueue = [{
            type: eventTypes.CLEAR,
            mode: drawingModes.CLEAR,
            color: '#000',
            weight: 1,
            x: 0, y: 0,
            px: 0, py: 0,
        }];

        let player = RoomManager.getRoomMembers().find(member => member.getId() === activePlayer);

        this.addChatMessage(
            `${player?.getUsername()} is an der Reihe!`,
            null,
            null,
            'choosing'
        );


        this.setState({
            activePlayerId: activePlayer,
            timerUntil: null,
            currentWord: null,
            currentMask: null,
        });
    }

    onNewGuessChatMessage(eventData: EventDataObject): void {
        let {sender,    // sender ID
            text,       // message text
            timestamp,  // server timestamp
            color       // color string or null
        } = eventData;

        this.addChatMessage(text, sender, timestamp, color);
        this.setState({});
    }

    onWordToGuessChanged(eventData: EventDataObject): void {
        let {mask, timeUntil} = eventData; // a string containing the letter mask and the timestamp, when the drawing is over!
        this.setState({
            currentMask: mask,
            timerUntil: timeUntil ?? this.state.timerUntil
        });
    }

    onCanvasChangedRemote(event: EventDataObject): void {
        if(event && this.state.activePlayerId !== ProfileManager.getId()) {
            this.drawingCommandQueue.push(event as canvasChangedEvent);
        }
    }


    /* ====================== */
    /* Locale Event Listeners */
    /* ====================== */

    onWordSelection(word: string): void {
        this.gameApi.sendMessageToServer('activeWordChosen', {
            selection: word
        });
    }

    onGameConfigSubmitted(config: GameConfigObject): void {
        this.gameApi.sendMessageToServer('submitConfigAndStart', {
            configuration: config
        });
        this.setState({
            defaultConfig: config
        });
    }

    onGameConfigChanged(config: GameConfigObject): void {
        this.gameApi.sendMessageToServer('configChangedPreview', {
            configuration: config
        });
    }

    onMessageSend(message: string): void {
        this.gameApi.sendMessageToServer('attemptGuess', {
            guess: message
        });
    }

    onGetQueuedDrawCommands(): canvasChangedEvent[] {
        let queue = this.drawingCommandQueue.shift();
        return queue ? [queue] : [];
    }

    onCanvasChanged(event: canvasChangedEvent): void {
        this.gameApi.sendMessageToServer('activeCanvasChanged', {
            canvasChangedEvent: event
        });
    }

    onChangeColor(newColor: string): void {
        this.setState({currentColor: newColor});
    }

    onChangeWeight(newWeight: number): void {
        this.setState({currentWeight: newWeight});
    }

    onChangeMode(newMode: string): void {
        this.setState({currentMode: newMode});
    }

    /* ============== */
    /* Helper Methods */
    /* ============== */

    addChatMessage(message: string, sender: string|null, timestamp: number|null, coloring: string|null = null): void {
        this.messageHistory.push({
            text: message,
            sender: sender || 'system',
            timestamp: timestamp || Date.now(),
            coloring: coloring
        });
        if(this.messageHistory.length > 50) {
            this.messageHistory.shift(); // remove oldest element
        }
        // sort messages: oldest first
        this.messageHistory = this.messageHistory.sort((a,b) => b.timestamp - a.timestamp);
    }

    /* ============== */
    /* Render Methods */
    /* ============== */

    renderPlayerListElement(user: User): JSX.Element {
        let isActivePlayer = this.state.activePlayerId === user.getId();

        return (
            <div key={user.getId()}>
                <span>{user.getUsername()}</span>
                <span>{isActivePlayer ? '[drawing]' : ''}</span>
                <span>{this.scoreboard[user.getId()] || 0}</span>
            </div>
        );
    }


    renderDrawingBoardSpace(allowDrawing: boolean, isUserRoomMaster: boolean, isActivePlayer: boolean): JSX.Element {
        let state = this.state.currentGameState;

        if(state === 'selecting' && !isActivePlayer) {
            state = 'waiting';
        }

        switch(state) {
            case 'configuration':
                return (
                    <GameConfig
                        onSubmit={this.onGameConfigSubmitted.bind(this)}
                        onChange={this.onGameConfigChanged.bind(this)}
                        allowChanges={isUserRoomMaster}
                        defaultConfig={isUserRoomMaster ? null : this.state.defaultConfig}
                    />
                );
            case 'selecting':
                return (
                    <WordSelection onSelect={this.onWordSelection.bind(this)}
                                   options={this.state.currentWordOptions}
                    />
                );
            default:
                return (
                    <DrawingCanvas
                        drawingMode={this.state.currentMode}
                        drawingColor={this.state.currentColor}
                        drawingWeight={this.state.currentWeight}
                        enableManualDrawing={allowDrawing}
                        gatherDrawCommandCallback={this.onGetQueuedDrawCommands.bind(this)}
                        onCanvasChanged={this.onCanvasChanged.bind(this)}
                    />
                );
        }
    }

    render(): ReactNode {
        let isActivePlayer = this.state.activePlayerId === ProfileManager.getId();
        let allowDrawing = isActivePlayer && this.state.currentGameState === 'drawing';
        let isUserRoomMaster = ProfileManager.getId() === RoomManager.getRoomMaster()?.getId();

        return (
            <div id={"drawAndGuess"} key={"drawAndGuess"}>
                <div className={"player-list"}>
                    <div key={this.state.totalScoreKey}>
                        {RoomManager.getRoomMembers().map(this.renderPlayerListElement.bind(this))}
                    </div>
                </div>
                <div className={"drawing-board"}>
                    {this.renderDrawingBoardSpace(allowDrawing, isUserRoomMaster, isActivePlayer)}

                    {(!allowDrawing || this.state.currentGameState === 'configuration') ? null :
                        <DrawingUtils
                            currentMode={this.state.currentMode}
                            currentWeight={this.state.currentWeight}
                            currentColor={this.state.currentColor}
                            onChangeMode={this.onChangeMode.bind(this)}
                            onChangeWeight={this.onChangeWeight.bind(this)}
                            onChangeColor={this.onChangeColor.bind(this)}
                        />
                    }
                </div>

                <div className={"guessing-chat"} style={{
                    opacity: this.state.currentGameState === 'configuration' ? 0.1 : 1
                }}>
                    <GameStateBox
                        countdownUntil={this.state.timerUntil}
                        wordMask={allowDrawing ? this.state.currentWord : this.state.currentMask}
                        isGuessing={!allowDrawing}
                    />
                    <ChatBox
                        onSendCallback={this.onMessageSend.bind(this)}
                        messageHistory={this.messageHistory}
                        isGuessing={!allowDrawing && this.state.currentGameState === 'drawing'}
                    />
                </div>
            </div>
        );
    }
}