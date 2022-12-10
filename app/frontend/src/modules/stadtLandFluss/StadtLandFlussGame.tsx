import React, {Component} from "react";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import stadtLandFluss from "./StadtLandFluss";
import ModuleGameApi from "../../framework/modules/ModuleGameApi";
import User from "../../framework/util/User";
import roomManager from "../../framework/util/RoomManager";
import profileManager from "../../framework/util/ProfileManager";
import SLFConfig from "./components/SLFConfig";
import SLFLetter from "./components/SLFLetter";
import SLFGuessing from "./components/SLFGuessing";
import SLFRoundResults from "./components/SLFRoundResults";
import SLFEndResults from "./components/SLFEndResults";

type gameConfig = {
    categories: string[],
    rounds: string
}

type guess = {
    user: User,
    guesses: object
}

type gameState = {
    active: boolean,
    players: object,
    config: gameConfig,
    round: number | null,
    guesses: guess[],
    gamePhase: string
}

export default class StadtLandFlussGame extends Component<{}, gameState> implements ModuleGameInterface {

    private readonly gameApi: ModuleGameApi

    private hasBeenMounted: boolean = false

    state = {
        active: false,
        config: {
            categories: ["Stadt", "Land", "Fluss"],
            rounds: "10"
        },
        guesses: [],
        players: {},
        round: 0,
        gamePhase: 'setup'
    }

    constructor(props: any) {
        super(props)
        this.gameApi = new ModuleGameApi(stadtLandFluss, this)
    }

    // this method is called, once the component is ready and setState can be used
    componentDidMount() {
        if (!this.hasBeenMounted) {
            this.gameApi.addEventHandler('updateGameState', this.onGameStateUpdate.bind(this));
            this.gameApi.sendMessageToServer("requestGameState",{})
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
            gamePhase: eventData.gamePhase
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
            case "letter":
                return <SLFLetter/>
            case "guessing":
                return <SLFGuessing/>
            case "round_results":
                return <SLFRoundResults/>
            case "end_screen":
                return <SLFEndResults/>
        }
    }

    renderBackToGameSelectionButton() {
        return this.isRoomMaster() ? <button onClick={this.returnToGameSelection.bind(this)}>Zur Spieleauswahl</button> : ""
    }

    render() {
        return (
            <div id={"stadtLandFluss"}>
                <p>Hier wird Stadt Land Fluss entstehen!</p>
                {this.renderBackToGameSelectionButton()}
                {this.getCurrentlyActiveSection()}
            </div>
        )
    }
}