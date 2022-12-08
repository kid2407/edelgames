import React, {Component} from "react";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import stadtLandFluss from "./StadtLandFluss";
import ModuleGameApi from "../../framework/modules/ModuleGameApi";
import User from "../../framework/util/User";

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
    players: User[],
    config: gameConfig,
    round: number | null,
    guesses: guess[]
}

export default class StadtLandFlussGame extends Component<{}> implements ModuleGameInterface {

    private readonly gameApi: ModuleGameApi

    state = {}

    constructor(props: any) {
        super(props)
        this.gameApi = new ModuleGameApi(stadtLandFluss, this)
    }

    // this method is called, once the component is ready and setState can be used
    componentDidMount() {
        this.gameApi.addEventHandler('updateState', this.onReceiveMessage.bind(this));
    }

    onReceiveMessage(eventData: gameState | any) {
        console.log("Received new game state from the server: ", eventData)
        // setState will trigger a rerender
        this.setState(eventData)
    }

    returnToLobby() {
        this.gameApi.sendMessageToServer("returnToLobby", {})
    }

    render() {
        return (
            <div id={"stadtLandFluss"}>
                <p>Hier wird Stadt Land Fluss entstehen!</p>
                <button onClick={this.returnToLobby.bind(this)}>Zurück zur Lobby</button>
            </div>
        );
    }
}