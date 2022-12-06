import React, {Component} from "react";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import stadtLandFluss from "./StadtLandFluss";
import ModuleGameApi from "../../framework/modules/ModuleGameApi";

export default class StadtLandFlussGame extends Component<{}> implements ModuleGameInterface {

    private readonly gameApi: ModuleGameApi

    constructor(props: any) {
        super(props)
        this.gameApi = new ModuleGameApi(stadtLandFluss, this)
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