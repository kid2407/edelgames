import React, {Component} from "react";
import {ConfigProps} from "../SLFTypes";

/**
 * Component for the game configuration screen.
 */
export default class SLFConfig extends Component<ConfigProps, {}> {

    /**
     * Send the updated config to the server.
     */
    private updateConfig() {
        let settingsDiv = document.getElementById("gameConfig")
        if (settingsDiv) {
            // @ts-ignore
            let categoriesString = settingsDiv.getElementsByClassName("categories")[0].value
            this.props.gameApi.getEventApi().sendMessageToServer("updateSettings", {
                // @ts-ignore
                rounds: parseInt(settingsDiv.getElementsByClassName("rounds")[0].value),
                categories: categoriesString ? categoriesString.split(",") : []
            })
        }
    }

    /**
     * Start the game.
     */
    private startGame() {
        this.props.gameApi.getEventApi().sendMessageToServer("startGame", {})
    }

    /**
     * Renders the component.
     */
    render() {
        return (
            <div id={"gameConfig"}>
                <h2>Spieleinstellungen</h2>
                <div className={"settingsWrapper"}>
                    <div className={"configRow"}>
                        <label>Anzahl der Runden:</label>
                        <input key={this.props.config.rounds} className={"rounds"} type={"number"} placeholder={"10"} defaultValue={this.props.config.rounds} readOnly={!this.props.isRoomMaster}/>
                    </div>
                    <div className={"configRow"}>
                        <label>Kategorien:</label>
                        <textarea key={this.props.config.categories.join("|")} className={"categories"} readOnly={!this.props.isRoomMaster} defaultValue={this.props.config.categories.join(",")}></textarea>
                    </div>
                </div>
                <div className={"configButtons"}>
                    {this.props.isRoomMaster ? <button onClick={this.updateConfig.bind(this)}>Anwenden</button> : ""}
                    {this.props.isRoomMaster ? <button onClick={this.startGame.bind(this)}>Spiel starten</button> : ""}
                </div>
            </div>
        )
    }

}