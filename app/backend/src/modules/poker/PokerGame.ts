import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleApi from "../../framework/modules/ModuleApi";
import {PokerCard, PokerCardType, PokerConfig, PokerGameState, PokerHandCard, PokerPhase} from "./PokerTypes";
import User from "../../framework/User";

/*
 * The actual game instance, that controls and manages the game
 */
export default class PokerGame implements ModuleGameInterface {

    private api: ModuleApi

    private gameState: PokerGameState

    onGameInitialize(api: ModuleApi): void {

        this.api = api;
        this.setInitialGameState()

        this.api.getEventApi().addEventHandler("requestGameState", this.onRequestGameState.bind(this))
        this.api.getEventApi().addEventHandler("updateConfig", this.onUpdateConfig.bind(this))
        this.api.getEventApi().addEventHandler("startGame", this.onGameStart.bind(this))

        this.api.getEventApi().addUserJoinedHandler(this.onPlayerJoin.bind(this))
        this.api.getEventApi().addUserLeaveHandler(this.onPlayerLeave.bind(this))

        this.api.getLogger().debug('Initialized game of Poker');
    }

    private sendCurrentGameState(): void {
        let newGameState = {
            config: this.gameState.config,
            round: this.gameState.round,
            running: this.gameState.running,
            handCards: {},
            phase: this.gameState.phase,
            players:this.gameState.players
        }

        this.api.getLogger().debug("Publishing new game state:")
        this.api.getPlayerApi().getRoomMembers().forEach(user => {
            newGameState.handCards = this.gameState?.handCards?.[user.getId()] ?? null

            this.api.getEventApi().sendPlayerMessage(user.getId(), "updateGameState", newGameState)
        })
    }

    private setInitialGameState(): void {
        this.gameState = {
            config: {
                startingMoney: 1000,
                smallBlind: 5,
                bigBlind: 10,
                firstBlindRaise: 5,
                firstBlindFactor: 2,
                secondBlindRaise: 10,
                secondBlindFactor: 4
            },
            deck: this.generateDeck(),
            round: 0,
            running: false,
            phase: PokerPhase.PREFLOP,
            handCards: {},
            communityCards: [],
            bets: {},
            dealerIndex: 0,
            pot: 0,
            highestRaise: null,
            lastRaiseBy: null,
            currentlyActiveUser: 0,
            players: this.api.getPlayerApi().getRoomMembers().map(u => u.getId())
        }
    }

    private onRequestGameState(){
        this.sendCurrentGameState()
    }

    private onPlayerJoin() {
        this.sendCurrentGameState()
    }

    private onPlayerLeave(eventData: { removedUser: User, }) {
        this.gameState.players = this.gameState.players.filter(id => id !== eventData.removedUser.getId())
        this.sendCurrentGameState()
    }

    private onUpdateConfig(eventData: { senderId: string, data: PokerConfig }): void {
        if (this.api.getPlayerApi().getRoomMaster().getId() === eventData.senderId) {
            this.api.getLogger().debug("Received new config for poker game: ", eventData)
            this.gameState.config = eventData.data
            this.sendCurrentGameState()
        }
    }

    private onGameStart(eventData: { senderId: string }) {
        if (this.api.getPlayerApi().isRoomMaster(eventData.senderId)) {
            this.api.getLogger().info("Starting game!")
            this.gameState.running = true
            this.prepareNextRound()
        }
    }

    private onNextRound(eventData: { senderId: string }) {
        if (this.api.getPlayerApi().isRoomMaster(eventData.senderId)) {
            this.api.getLogger().debug("Proceeding to the next round!")
            this.prepareNextRound()
        }
    }

    private generateDeck(): PokerCard[] {
        let cards: PokerCard[] = []

        for (let i = 2; i <= 14; i++) {
            for (let pokerCardTypeKey in PokerCardType) {
                cards.push({
                    suit: PokerCardType[pokerCardTypeKey as keyof typeof PokerCardType],
                    value: i
                })
            }
        }

        cards.sort(() => 0.5 - Math.random())

        return cards;
    }

    private generateHandCards(): { [userId: string]: PokerHandCard } {
        let handCards: { [userId: string]: PokerHandCard } = {}

        this.gameState.players.forEach(id => {
            handCards[id] = {
                firstCard: this.gameState.deck.pop(),
                secondCard: this.gameState.deck.pop()
            }
        })

        return handCards
    }

    private prepareNextRound() {
        this.gameState.round++
        this.gameState.bets = {}
        this.gameState.currentlyActiveUser = 0
        this.gameState.communityCards = []
        this.gameState.players = this.api.getPlayerApi().getRoomMembers().map(u => u.getId())
        this.gameState.handCards = this.generateHandCards()
        this.gameState.highestRaise = null
        this.gameState.lastRaiseBy = null
        this.gameState.dealerIndex = this.gameState.dealerIndex === this.gameState.players.length ? 0 : this.gameState.dealerIndex + 1

        this.sendCurrentGameState()
    }

}