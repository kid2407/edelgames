import React, {Component, ReactNode} from "react";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import SLFConfig from "./components/SLFConfig";
import SLFGuessing from "./components/SLFGuessing";
import SLFRoundResults from "./components/SLFRoundResults";
import SLFEndResults from "./components/SLFEndResults";
import {gameState} from "./SLFTypes";
import stadtLandFluss from "./StadtLandFluss";
import ModuleApi from "../../framework/modules/ModuleApi";

/**
 * Main component for the Stadt Land Fluss game.
 */
export default class StadtLandFlussGame extends Component<{}, gameState> implements ModuleGameInterface {

    private readonly api: ModuleApi;

    private hasBeenMounted: boolean = false

    /**
     * The initial game state when the game is created / loaded.
     */
    state = {
        active: false,
        config: {
            categories: ["Stadt", "Land", "Fluss"],
            rounds: 10
        },
        guesses: {},
        players: [],
        round: 0,
        gamePhase: 'setup',
        letter: "",
        ready_users: 0,
        points: {},
        point_overrides: {}
    }

    constructor(props: any) {
        super(props)
        this.api = new ModuleApi(stadtLandFluss, this)
    }

    /**
     * Once the component has been mounted and can accept a state, this method is called.
     * Registers an event handler that listens for updates on the game state as well as requests an initial version from the server.
     */
    componentDidMount(): void {
        if (!this.hasBeenMounted) {
            this.api.getEventApi().addEventHandler('updateGameState', this.onGameStateUpdate.bind(this));
            this.api.getEventApi().sendMessageToServer("requestGameState", {})
            this.hasBeenMounted = true
        }
    }

    /**
     * Called when the server send a new game state, updating the existing values.
     *
     * @param {gameState|any} eventData
     */
    private onGameStateUpdate(eventData: gameState | any): void {
        this.setState({
            active: eventData.active,
            config: eventData.config,
            guesses: eventData.guesses,
            players: eventData.players,
            round: eventData.round,
            gamePhase: eventData.gamePhase,
            letter: eventData.letter,
            ready_users: eventData.ready_users,
            points: eventData.points,
            point_overrides: eventData.point_overrides
        })
    }

    /**
     * Return to the game selection screen.
     */
    private returnToGameSelection(): void {
        this.api.getEventApi().sendMessageToServer("returnToGameSelection", {})
    }


    /**
     * Return the appropriate component for the current game phase.
     */
    private getCurrentlyActiveSection(): ReactNode {
        // @ts-ignore
        if (!this.state.players.includes(this.api.getPlayerApi().getLocalePlayer().getId())){
            return <p>Das Spiel läuft gerade, bitte warte bis zur nächsten Runde, um mitzuspielen.</p>
        }
        let isRoomMaster = this.api.getPlayerApi().getLocalePlayer().isRoomMaster();

        switch (this.state.gamePhase) {
            case "setup":
                return <SLFConfig gameApi={this.api}
                                  isRoomMaster={isRoomMaster}
                                  config={this.state.config}/>
            case "guessing":
                return <SLFGuessing gameApi={this.api}
                                    isRoomMaster={isRoomMaster}
                                    categories={this.state.config.categories}
                                    guesses={this.state.guesses}
                                    letter={this.state.letter}
                                    max_rounds={this.state.config.rounds}
                                    round={this.state.round}
                                    ready_users={this.state.ready_users}
                                    user_count={this.state.players.length}/>
            case "round_results":
                return <SLFRoundResults gameApi={this.api}
                                        letter={this.state.letter}
                                        round={this.state.round}
                                        max_rounds={this.state.config.rounds}
                                        guesses={this.state.guesses}
                                        categories={this.state.config.categories}
                                        players={this.state.players}
                                        isRoomMaster={isRoomMaster}
                                        points={this.state.points}
                                        point_overrides={this.state.point_overrides}/>
            case "end_screen":
                return <SLFEndResults points={this.state.points}
                                      isRoomMaster={isRoomMaster}
                                      gameApi={this.api}/>
            default:
                return <p>Oh no - something went wrong! Unknown game phase "{this.state.gamePhase}"</p>
        }
    }

    /**
     * Renders the "Zur Spielauswahl" button.
     */
    private renderBackToGameSelectionButton(): ReactNode {
        return this.api.getPlayerApi().getLocalePlayer().isRoomMaster() ? <button onClick={this.returnToGameSelection.bind(this)}>Zur Spielauswahl</button> : null;
    }

    /**
     * Render the component.
     */
    render(): ReactNode {
        return (
            <div id={"stadtLandFluss"}>
                {this.renderBackToGameSelectionButton()}
                {this.getCurrentlyActiveSection()}
            </div>
        )
    }
}