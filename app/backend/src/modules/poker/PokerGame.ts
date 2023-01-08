import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleApi from "../../framework/modules/ModuleApi";
import {PokerCard, PokerCardType, PokerConfig, PokerGameState} from "./PokerTypes";

/*
 * The actual game instance, that controls and manages the game
 */
export default class PokerGame implements ModuleGameInterface {

    private api: ModuleApi;

    private gameState: PokerGameState

    onGameInitialize(api: ModuleApi): void {
        this.setInitialGameState()

        this.api = api;

        this.api.getEventApi().addEventHandler("updateConfig", this.onUpdateConfig.bind(this))
        this.api.getEventApi().addEventHandler("startGame", this.onGameStart.bind(this))

        this.api.getLogger().debug('Initialized game of Poker');
    }

    private sendCurrentGameState(): void {
        let newGameState = {
            config: this.gameState.config,
            round: this.gameState.round,
            running: this.gameState.running
        }

        this.api.getLogger().debug("Publishing new game state:", newGameState)
        this.api.getEventApi().sendRoomMessage("updateGameState", newGameState)
    }

    private generateDeck(): PokerCard[] {
        let cards: PokerCard[] = []

        for (let i = 2; i <= 14; i++) {
            for (let pokerCardTypeKey in PokerCardType) {
                cards.push({
                    type: PokerCardType[pokerCardTypeKey as keyof typeof PokerCardType],
                    value: i
                })
            }
        }

        cards.sort(() => 0.5 - Math.random());

        return cards;
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
            running: false
        }
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
        }
    }

}