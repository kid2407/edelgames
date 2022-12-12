import React, {Component} from "react";
import ModuleGameApi from "../../../framework/modules/ModuleGameApi";

export default class SLFConfig extends Component<{ isRoomMaster: boolean, gameApi: ModuleGameApi, config: { rounds: number, categories: string[] } }, {}> {

    private updateConfig() {
        let settingsDiv = document.getElementById("gameConfig")
        if (settingsDiv) {
            // @ts-ignore
            let categoriesString = settingsDiv.getElementsByClassName("categories")[0].value
            this.props.gameApi.sendMessageToServer("updateSettings", {
                // @ts-ignore
                rounds: settingsDiv.getElementsByClassName("rounds")[0].value,
                categories: categoriesString ? categoriesString.split(",") : []
            })
        }
    }

    private startGame() {
        this.props.gameApi.sendMessageToServer("startGame", {})
    }

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