import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleRoomApi from "../../framework/modules/ModuleRoomApi";
import User from "../../framework/User";
import debug from "../../framework/util/debug";

type gameConfig = {
    categories: string[],
    rounds: number
}

type guess = {
    user: User,
    guesses: object
}

type gameState = {
    active: boolean,
    players: object | any,
    config: gameConfig,
    round: number | null,
    guesses: guess[],
    gamePhase: string
}

export default class StadtLandFlussGame implements ModuleGameInterface {
    roomApi: ModuleRoomApi | null = null;
    gameState: gameState | null = null

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
        guesses: [],
        players: {},
        round: 0,
        gamePhase: this.gamePhases.SETUP
    }

    log(logLevel: number = 0, ...args: any[]) {
        debug(logLevel, "[Stadt Land Fluss]", args)
    }

    onGameInitialize(roomApi: ModuleRoomApi): void {
        this.roomApi = roomApi;
        this.roomApi.addEventHandler("returnToGameSelection", this.returnToGameSelection.bind(this))
        this.roomApi.addEventHandler("updateSettings", this.onUpdateSettings.bind(this))
        this.roomApi.addEventHandler("startGame", this.onStartGame.bind(this))
        this.roomApi.addEventHandler("beginRound", this.onStartGame.bind(this))
        this.roomApi.addEventHandler("updateGuesses", this.onUpdateGuesses.bind(this))
        this.roomApi.addEventHandler("requestGameState", this.sendGameState.bind(this))

        this.roomApi.addUserJoinedHandler(this.onUserJoin.bind(this))
        this.roomApi.addUserLeaveHandler(this.onUserLeave.bind(this))
        this.gameState = this.initialGameState
        for (let roomMember of this.roomApi.room.getRoomMembers()) {
            this.gameState.players[roomMember.getId()] = roomMember
        }
    }


    returnToGameSelection() {
        this.roomApi.cancelGame()
    }

    private publishGameState(user:string|null = null) {
        let state = this.gameState
        let toPublish = {
            active: state.active,
            players: Object.keys(state.players),
            config: state.config,
            round: state.round,
            guesses: state.guesses.map(g => ({guesses: g.guesses, user: g.user.getId()})),
            gamePhase: state.gamePhase
        }

        this.log(0, "sending new game state:", toPublish)
        if (user !== null) {
            this.roomApi.sendPlayerMessage(user, "updateGameState", toPublish)
        } else {
            this.roomApi.sendRoomMessage("updateGameState", toPublish)
        }
    }

    sendGameState(eventData: {senderId:string,messageTypeId:string}) {
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
            this.publishGameState()
            this.log(0, `Removed ${user.getId()} (${user.getUsername()}) from the player list since they were in it.`)
        }
    }

    onUpdateSettings(eventData: { rounds: number, categories: string[] }) {
        this.gameState.config = eventData
        this.publishGameState()
    }

    onStartGame() {
    }

    onBeginRound() {
    }

    onUpdateGuesses(eventData: object) {
    }

}