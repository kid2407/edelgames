import React, {Component} from "react";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import stadtLandFluss from "./StadtLandFluss";
import ModuleGameApi from "../../framework/modules/ModuleGameApi";
import roomManager from "../../framework/util/RoomManager";
import profileManager from "../../framework/util/ProfileManager";
import SLFConfig from "./components/SLFConfig";
import SLFGuessing from "./components/SLFGuessing";
import SLFRoundResults from "./components/SLFRoundResults";
import SLFEndResults from "./components/SLFEndResults";

type gameConfig = {
    categories: string[],
    rounds: number
}

export type Guesses = {
    [userId: string]: {
        [letter: string]: string[]
    }
}

export type gameState = {
    active: boolean,
    players: object,
    config: gameConfig,
    round: number | null,
    guesses: Guesses,
    gamePhase: string,
    letter: string
}

export default class StadtLandFlussGame extends Component<{}, gameState> implements ModuleGameInterface {

    private readonly gameApi: ModuleGameApi

    private hasBeenMounted: boolean = false

    state = {
        active: false,
        config: {
            categories: ["Stadt", "Land", "Fluss"],
            rounds: 10
        },
        guesses: {},
        players: {},
        round: 0,
        gamePhase: 'setup',
        letter: ""
    }

    constructor(props: any) {
        super(props)
        this.gameApi = new ModuleGameApi(stadtLandFluss, this)
    }

    // this method is called, once the component is ready and setState can be used
    componentDidMount() {
        if (!this.hasBeenMounted) {
            this.gameApi.addEventHandler('updateGameState', this.onGameStateUpdate.bind(this));
            this.gameApi.sendMessageToServer("requestGameState", {})
            this.hasBeenMounted = true
        }
    }

    onGameStateUpdate(eventData: gameState | any) {
        this.setState({
            active: eventData.active,
            config: eventData.config,
            guesses: eventData.guesses,
            players: eventData.players,
            round: eventData.round,
            gamePhase: eventData.gamePhase,
            letter:eventData.letter
        })
    }

    returnToGameSelection() {
        this.gameApi.sendMessageToServer("returnToGameSelection", {})
    }


    isRoomMaster() {
        let roomMaster = roomManager.getRoomMaster()
        return roomMaster !== null && profileManager.getId() === roomMaster.getId()
    }

    getCurrentlyActiveSection() {
        switch (this.state.gamePhase) {
            case "setup":
                return <SLFConfig gameApi={this.gameApi} isRoomMaster={this.isRoomMaster()} config={this.state.config}/>
            case "guessing":
                return <SLFGuessing gameApi={this.gameApi} isRoomMaster={this.isRoomMaster()} categories={this.state.config.categories} guesses={this.state.guesses} letter={this.state.letter} max_rounds={this.state.config.rounds} round={this.state.round}/>
            case "round_results":
                return <SLFRoundResults/>
            case "end_screen":
                return <SLFEndResults/>
        }
    }

    renderBackToGameSelectionButton() {
        return this.isRoomMaster() ? <button onClick={this.returnToGameSelection.bind(this)}>Zur Spielauswahl</button> : ""
    }

    render() {
        return (
            <div id={"stadtLandFluss"}>
                {this.renderBackToGameSelectionButton()}
                {this.getCurrentlyActiveSection()}
            </div>
        )
    }
}