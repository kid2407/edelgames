import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleRoomApi from "../../framework/modules/ModuleRoomApi";
import User from "../../framework/User";
import debug from "../../framework/util/debug";

type gameConfig = {
    categories: string[],
    rounds: number
}

type guesses = {
    [userId: string]: {
        [letter: string]: string[]
    }
}

type gameState = {
    active: boolean,
    players: object | any,
    config: gameConfig,
    round: number,
    guesses: guesses,
    gamePhase: string,
    letter: string,
    ready_users: string[]
}

export default class StadtLandFlussGame implements ModuleGameInterface {
    roomApi: ModuleRoomApi | null = null;
    gameState: gameState | null = null

    private usedLetters: string[] = []

    private readonly gamePhases = {
        SETUP: 'setup',
        LETTER: 'letter',
        GUESSING: 'guessing',
        ROUND_RESULTS: 'round_results',
        END_SCREEN: 'end_screen'
    }

    initialGameState: gameState = {
        active: false,
        config: {
            categories: ["Stadt", "Land", "Fluss"],
            rounds: 10
        },
        guesses: {},
        players: {},
        round: 0,
        gamePhase: this.gamePhases.SETUP,
        letter: "",
        ready_users: []
    }

    log(logLevel: number = 0, ...args: any[]) {
        debug(logLevel, "[Stadt Land Fluss]", args)
    }

    onGameInitialize(roomApi: ModuleRoomApi): void {
        this.roomApi = roomApi;
        this.roomApi.addEventHandler("returnToGameSelection", this.onReturnToGameSelection.bind(this))
        this.roomApi.addEventHandler("updateSettings", this.onUpdateSettings.bind(this))
        this.roomApi.addEventHandler("startGame", this.onStartGame.bind(this))
        this.roomApi.addEventHandler("beginRound", this.onNextRound.bind(this))
        this.roomApi.addEventHandler("updateGuesses", this.onUpdateGuesses.bind(this))
        this.roomApi.addEventHandler("requestGameState", this.onRequestGameState.bind(this))
        this.roomApi.addEventHandler("unready", this.onUnready.bind(this))

        this.roomApi.addUserJoinedHandler(this.onUserJoin.bind(this))
        this.roomApi.addUserLeaveHandler(this.onUserLeave.bind(this))
        this.gameState = this.initialGameState
        for (let roomMember of this.roomApi.room.getRoomMembers()) {
            this.gameState.players[roomMember.getId()] = roomMember
        }
    }


    onReturnToGameSelection() {
        this.roomApi.cancelGame()
    }

    private publishGameState(user: string | null = null) {
        let state = this.gameState
        let toPublish = {
            active: state.active,
            players: Object.keys(state.players),
            config: state.config,
            round: state.round,
            guesses: state.guesses,
            gamePhase: state.gamePhase,
            letter: state.letter,
            ready_users: state.ready_users.length
        }

        this.log(0, "sending new game state:", toPublish)
        if (user !== null) {
            this.roomApi.sendPlayerMessage(user, "updateGameState", toPublish)
        } else {
            this.roomApi.sendRoomMessage("updateGameState", toPublish)
        }
    }

    onRequestGameState(eventData: { senderId: string, messageTypeId: string }) {
        this.publishGameState(eventData.senderId)
    }


    onUserJoin(eventData: { newUser: User, userList: Array<{ username: string, id: string, picture: string | null, isRoomMaster: boolean }> }) {
        let user = eventData.newUser
        this.log(0, `User ${user.getId()} joined Stadt Land Fluss in room ${this.roomApi.getGameId()}.`)
        if (!this.gameState.active && !(user.getId() in this.gameState.players)) {
            this.gameState.players[user.getId()] = user
            this.publishGameState()
            this.log(0, `Added user ${user.getId()} (${user.getUsername()}) to the player list since the game is not active.`)
        }
    }

    onUserLeave(eventData: { removedUser: User, userList: object[] }) {
        let user = eventData.removedUser
        this.log(0, `User ${user.getId()} left the Stadt Land Fluss room ${user.getCurrentRoom().getRoomId()}.`)
        if (user.getId() in this.gameState.players) {
            delete this.gameState.players[user.getId()]
            this.gameState.ready_users = this.gameState.ready_users.filter(id => id !== user.getId())
            this.publishGameState()
            this.log(0, `Removed ${user.getId()} (${user.getUsername()}) from the player list since they were in it.`)
        }
    }

    onUpdateSettings(newConfig: { rounds: number, categories: string[] }) {
        if (newConfig.rounds > 26) {
            newConfig.rounds = 26
        }
        this.gameState.config = newConfig
        this.publishGameState()
    }

    onStartGame() {
        this.gameState.active = true
        this.gameState.gamePhase = this.gamePhases.GUESSING
        this.onNextRound()
    }

    onNextRound(): void {
        this.gameState.round += 1
        this.gameState.letter = this.getRandomLetter()
        this.publishGameState()
    }

    onUpdateGuesses(eventData: { senderId: string, guesses: string[] }) {
        if (!this.gameState.guesses.hasOwnProperty(eventData.senderId)) {
            this.gameState.guesses[eventData.senderId] = {}
        }
        this.gameState.guesses[eventData.senderId][this.gameState.letter] = eventData.guesses
        if (!(eventData.senderId in this.gameState.ready_users)) {
            this.gameState.ready_users.push(eventData.senderId)
        }

        // All users finished guessing for the round
        if (this.gameState.ready_users.length === Object.keys(this.gameState.players).length) {
            this.gameState.gamePhase = this.gamePhases.ROUND_RESULTS
            this.gameState.ready_users = []
            this.log(0, "Switching to round results.")
        }

        this.publishGameState()
    }

    onUnready(eventData: { senderId: string }) {
        this.gameState.ready_users = this.gameState.ready_users.filter(id => id !== eventData.senderId)
        this.publishGameState()
    }

    getRandomLetter(tries: number = 0): string {
        let letter = String.fromCharCode(Math.floor(Math.random() * 26) + 65)
        if (letter in this.usedLetters) {
            if (tries >= 26) {
                console.error("No free letters available!")
                return
            }
            return this.getRandomLetter(tries + 1)
        }
        this.usedLetters.push(letter)

        return letter
    }

}