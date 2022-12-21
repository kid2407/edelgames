import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleRoomApi from "../../framework/modules/ModuleRoomApi";
import User from "../../framework/User";
import debug from "../../framework/util/debug";
import {gameState} from "./SLFTypes";

/**
 * Main class for the Stadt Land Fluss game.
 */
export default class StadtLandFlussGame implements ModuleGameInterface {
    roomApi: ModuleRoomApi | null = null;
    gameState: gameState | null = null

    /**
     * Available / unused letters for this game.
     */
    private availableLetters: string[] = Array.from({length: 26}, (v, k) => String.fromCharCode(k + 65))

    /**
     * The possible game phases.
     */
    private readonly gamePhases = {
        SETUP: 'setup',
        GUESSING: 'guessing',
        ROUND_RESULTS: 'round_results',
        END_SCREEN: 'end_screen'
    }

    /**
     * Point values for invalid, duplicate and unique guesses.
     */
    private readonly guessPoints = {
        INVALID: 0,
        MULTIPLE: 10,
        UNIQUE: 20
    }

    /**
     * The initial game state.
     */
    private readonly initialGameState: gameState = {
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
        ready_users: [],
        points: {},
        point_overrides: {}
    }

    log(logLevel: number = 0, ...args: any[]) {
        debug(logLevel, "[Stadt Land Fluss]", args)
    }

    /**
     * Register the relevant event handlers and set up the initial player list.
     *
     * @param {ModuleRoomApi} roomApi
     */
    onGameInitialize(roomApi: ModuleRoomApi): void {
        this.roomApi = roomApi;
        this.roomApi.addEventHandler("returnToGameSelection", this.onReturnToGameSelection.bind(this))
        this.roomApi.addEventHandler("updateSettings", this.onUpdateSettings.bind(this))
        this.roomApi.addEventHandler("startGame", this.onStartGame.bind(this))
        this.roomApi.addEventHandler("nextRound", this.onNextRound.bind(this))
        this.roomApi.addEventHandler("updateGuesses", this.onUpdateGuesses.bind(this))
        this.roomApi.addEventHandler("requestGameState", this.onRequestGameState.bind(this))
        this.roomApi.addEventHandler("unready", this.onUnready.bind(this))
        this.roomApi.addEventHandler("playAgain", this.onPlayAgain.bind(this))
        this.roomApi.addEventHandler("setDownvote", this.onToggleDownvote.bind(this))

        this.roomApi.addUserJoinedHandler(this.onUserJoin.bind(this))
        this.roomApi.addUserLeaveHandler(this.onUserLeave.bind(this))
        this.gameState = {...this.initialGameState}
        for (let roomMember of this.roomApi.getRoomsMembers()) {
            this.gameState.players[roomMember.getId()] = roomMember
        }
    }


    /**
     * Cancel the game and return to the game selection screen.
     */
    private onReturnToGameSelection() {
        this.roomApi.cancelGame()
    }

    /**
     * Send the current game state to all users or a specific one, if specified via the `user` parameter.
     *
     * @param {string} user
     */
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
            ready_users: state.ready_users.length,
            points: state.points,
            point_overrides: state.point_overrides
        }

        this.log(0, "sending new game state:", toPublish)
        if (user !== null) {
            this.roomApi.sendPlayerMessage(user, "updateGameState", toPublish)
        } else {
            this.roomApi.sendRoomMessage("updateGameState", toPublish)
        }
    }

    /**
     * Calculate the points for the current round.
     */
    private calculatePointsForRound(): { [category: number]: { [userId: string]: number } } {
        let pointsForRound: { [category: number]: { [userId: string]: number } } = {}
        let letter = this.gameState.letter
        let guesses = this.gameState.guesses
        let guessForUser = []
        let guessesByCategory = new Map<number, { [guess: string]: string[] }>()
        let usersForGuess: string[]
        let guessesForSingleCategory: { [guess: string]: string[] } = {}

        for (let userId in guesses) {
            if (guesses.hasOwnProperty(userId)) {
                guessForUser = guesses[userId][letter]
                guessForUser.forEach((guess, categoryIndex) => {
                    if (!guessesByCategory.has(categoryIndex)) {
                        guessesByCategory.set(categoryIndex, {})
                    }
                    guessesForSingleCategory = guessesByCategory.get(categoryIndex)
                    usersForGuess = guessesForSingleCategory.hasOwnProperty(guess) ? guessesForSingleCategory[guess] : []
                    usersForGuess.push(userId)
                    guessesForSingleCategory[guess] = usersForGuess
                    guessesByCategory.set(categoryIndex, guessesForSingleCategory)
                })
            }
        }

        guessesByCategory.forEach((entries, categoryIndex) => {
                pointsForRound[categoryIndex] = {}
                for (let currentGuess in entries) {
                    if (entries.hasOwnProperty(currentGuess)) {
                        let usersForCurrentGuess = entries[currentGuess]
                        let pointsForGuess: number
                        if (!currentGuess.toLowerCase().startsWith(this.gameState.letter.toLowerCase())) {
                            pointsForGuess = this.guessPoints.INVALID
                        }
                        // Only one player has made this guess
                        else if (usersForCurrentGuess.length === 1) {
                            pointsForGuess = this.guessPoints.UNIQUE
                            // Two or more players have made this guess
                        } else if (usersForCurrentGuess.length > 1) {
                            pointsForGuess = this.guessPoints.MULTIPLE
                        }
                        usersForCurrentGuess.forEach((u) => {
                            if (this.gameState.point_overrides[u]?.[categoryIndex]?.length ?? 0 === Object.keys(this.gameState.players).length - 1) {
                                pointsForRound[categoryIndex][u] = 0
                            } else {
                                pointsForRound[categoryIndex][u] = pointsForGuess
                            }
                        })
                    }
                }
            }
        )

        return pointsForRound
    }

    /**
     * Send the current game state to the user who requested it.
     *
     * @param {{ senderId: string, messageTypeId: string }} eventData
     */
    private onRequestGameState(eventData: { senderId: string, messageTypeId: string }): void {
        this.publishGameState(eventData.senderId)
    }


    /**
     * Perform required tasks when a user joins.
     *
     * @param {{ newUser: User, userList: Array<{ username: string, id: string, picture: string | null, isRoomMaster: boolean }> }} eventData
     */
    private onUserJoin(eventData: { newUser: User, userList: Array<{ username: string, id: string, picture: string | null, isRoomMaster: boolean }> }): void {
        let user = eventData.newUser
        this.log(0, `User ${user.getId()} joined Stadt Land Fluss in room ${this.roomApi.getGameId()}.`)
        if (!this.gameState.active && !(user.getId() in this.gameState.players)) {
            this.gameState.players[user.getId()] = user
            this.publishGameState()
            this.log(0, `Added user ${user.getId()} (${user.getUsername()}) to the player list since the game is not active.`)
        }
    }

    /**
     * Perform required tasks when a user leaves.
     *
     * @param eventData
     */
    private onUserLeave(eventData: { removedUser: User, userList: object[] }): void {
        let user = eventData.removedUser
        this.log(0, `User ${user.getId()} left the Stadt Land Fluss room ${user.getCurrentRoom().getRoomId()}.`)
        if (user.getId() in this.gameState.players) {
            delete this.gameState.players[user.getId()]
            this.gameState.ready_users = this.gameState.ready_users.filter(id => id !== user.getId())
            this.publishGameState()
            this.log(0, `Removed ${user.getId()} (${user.getUsername()}) from the player list since they were in it.`)
        }
    }

    /**
     * Update the game settings.
     *
     * @param {{ senderId: string, rounds: number, categories: string[] }} newConfig
     */
    private onUpdateSettings(newConfig: { senderId: string, rounds: number, categories: string[] }): void {
        if (this.roomApi.getRoomMaster().getId() === newConfig.senderId) {
            if (newConfig.rounds > 26) {
                newConfig.rounds = 26
            }
            this.gameState.config = newConfig
            this.publishGameState()
        }
    }

    /**
     * Start the game.
     *
     * @param {{ senderId: string }} eventData
     */
    private onStartGame(eventData: { senderId: string }): void {
        if (this.roomApi.getRoomMaster().getId() === eventData.senderId) {
            this.gameState.active = true
            this.gameState.gamePhase = this.gamePhases.GUESSING
            this.onNextRound(eventData)
        }
    }

    /**
     * Start the next round.
     *
     * @param {{ senderId: string }} eventData
     */
    private onNextRound(eventData: { senderId: string }): void {
        if (this.roomApi.getRoomMaster().getId() === eventData.senderId) {
            if (this.gameState.round < this.gameState.config.rounds) {
                this.gameState.round += 1
                this.gameState.letter = this.getRandomLetter()
                this.gameState.gamePhase = this.gamePhases.GUESSING
            } else {
                this.gameState.gamePhase = this.gamePhases.END_SCREEN
            }

            this.gameState.point_overrides = {}

            this.publishGameState()

            // TODO Update player list with new players
        }
    }

    /**
     * Update the guesses for one user for the current categories.
     *
     * @param {{ senderId: string, guesses: string[], ready: boolean }} eventData
     */
    private onUpdateGuesses(eventData: { senderId: string, guesses: string[], ready: boolean }): void {
        if (!this.gameState.guesses.hasOwnProperty(eventData.senderId)) {
            this.gameState.guesses[eventData.senderId] = {}
        }
        this.gameState.guesses[eventData.senderId][this.gameState.letter] = eventData.guesses
        if (eventData.ready && !(eventData.senderId in this.gameState.ready_users)) {
            this.gameState.ready_users.push(eventData.senderId)
        }

        // All users finished guessing for the round
        if (this.gameState.ready_users.length === Object.keys(this.gameState.players).length) {
            this.gameState.gamePhase = this.gamePhases.ROUND_RESULTS
            this.gameState.ready_users = []
            this.gameState.points[this.gameState.letter] = this.calculatePointsForRound()
            this.log(0, "Switching to round results.")
        }

        this.publishGameState()
    }

    /**
     * Set a player as "unready" for the current guessing phase.
     *
     * @param {{ senderId: string }} eventData
     */
    private onUnready(eventData: { senderId: string }): void {
        this.gameState.ready_users = this.gameState.ready_users.filter(id => id !== eventData.senderId)
        this.publishGameState()
    }

    /**
     * Reset the game and return to the initial config screen.
     * @param {{ senderId: string }} eventData
     */
    private onPlayAgain(eventData: { senderId: string }): void {
        if (this.roomApi.getRoomMaster().getId() === eventData.senderId) {
            let newState = Object.create(this.initialGameState)
            newState.config = this.gameState.config
            newState.players = this.gameState.players

            this.gameState = newState
            this.publishGameState()
        }
    }

    /**
     * Toggle a downvote for one guess by one player.
     *
     * @param {{ senderId: string, userId: string, categoryIndex: number, isActive: boolean }} eventData
     */
    private onToggleDownvote(eventData: { senderId: string, userId: string, categoryIndex: number, isActive: boolean }): void {
        let userId = eventData.userId
        let categoryIndex = eventData.categoryIndex
        let senderId = eventData.senderId

        if (!this.gameState.point_overrides.hasOwnProperty(userId)) {
            this.gameState.point_overrides[userId] = {}
        }

        if (!eventData.isActive) {
            let voterIndex = this.gameState.point_overrides[userId]?.[categoryIndex]?.indexOf(senderId)
            if (voterIndex > -1) {
                this.gameState.point_overrides[userId]?.[categoryIndex]?.splice(voterIndex, 1)
            }
        } else {
            if (!this.gameState.point_overrides[userId]?.[categoryIndex]?.includes(senderId)) {
                if (!this.gameState.point_overrides[userId]) {
                    this.gameState.point_overrides[userId] = {}
                }
                if (!this.gameState.point_overrides[userId][categoryIndex]) {
                    this.gameState.point_overrides[userId][categoryIndex] = []
                }

                this.gameState.point_overrides[userId]?.[categoryIndex]?.push(senderId)
            }
        }

        this.gameState.points[this.gameState.letter] = this.calculatePointsForRound()

        this.publishGameState()
    }

    /**
     * Generate a random letter to use next.
     */
    private getRandomLetter(): string {
        let letterIndex = Math.floor(Math.random() * this.availableLetters.length)
        if (this.availableLetters.length > 0) {
            let letter = this.availableLetters[letterIndex]
            this.availableLetters.splice(letterIndex, 1)
            return letter
        }

        throw new Error("For some reason more than 26 round were played. There are no more letters to use.")
    }

}