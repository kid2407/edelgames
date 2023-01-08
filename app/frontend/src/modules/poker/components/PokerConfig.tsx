import React, {BaseSyntheticEvent, Component} from "react";
import {PokerConfigProps} from "../PokerTypes";

export default class PokerConfig extends Component<PokerConfigProps, {}> {

    private updateSettings(formSubmitEvent: BaseSyntheticEvent) {
        formSubmitEvent.preventDefault()
        let target = formSubmitEvent.target

        let newConfig = {
            startingMoney: parseFloat(target.getElementsByClassName("startingMoney")[0].value),
            smallBlind: parseFloat(target.getElementsByClassName("smallBlind")[0].value),
            bigBlind: parseFloat(target.getElementsByClassName("bigBlind")[0].value),
            firstBlindRaise: parseFloat(target.getElementsByClassName("firstBlindRaise")[0].value),
            firstBlindFactor: parseFloat(target.getElementsByClassName("firstBlindFactor")[0].value),
            secondBlindRaise: parseFloat(target.getElementsByClassName("secondBlindRaise")[0].value),
            secondBlindFactor: parseFloat(target.getElementsByClassName("secondBlindFactor")[0].value)
        }

        this.props.api.getLogger().debug("Submitting new config:", newConfig)
        this.props.api.getEventApi().sendMessageToServer("updateConfig", {data: newConfig})
    }

    private startGame() {
        this.props.api.getEventApi().sendMessageToServer("startGame")
    }

    render() {
        return <div className={"settingsOverlay"}>
            <div className={"wrapper"}>
                <h2>Spiel-Einstellungen</h2>
                <form onSubmit={this.updateSettings.bind(this)}>
                    <fieldset>
                        <div>
                            <div className={"row"}>
                                <label>Startkapital:</label>
                                <input name={"startingMoney"} className={"startingMoney"} key={this.props.config.startingMoney} type={"number"} min={10} defaultValue={this.props.config.startingMoney} readOnly={!this.props.isRoomMaster}/>
                            </div>
                            <div className={"row"}>
                                <label>Small Blind:</label>
                                <input name={"smallBlind"} className={"smallBlind"} key={this.props.config.smallBlind} type={"number"} min={0} defaultValue={this.props.config.smallBlind} readOnly={!this.props.isRoomMaster}/>
                            </div>
                            <div className={"row"}>
                                <label>Big Blind:</label>
                                <input name={"bigBlind"} className={"bigBlind"} key={this.props.config.bigBlind} type={"number"} min={0} defaultValue={this.props.config.bigBlind} readOnly={!this.props.isRoomMaster}/>
                            </div>
                            <hr/>
                            <div className={"row"}>
                                <label>1. Blind Erhöhung (Runden):</label>
                                <input name={"firstBlindRaise"} className={"firstBlindRaise"} key={this.props.config.firstBlindRaise} type={"number"} min={1} defaultValue={this.props.config.firstBlindRaise} readOnly={!this.props.isRoomMaster}/>
                            </div>
                            <div className={"row"}>
                                <label>1. Blind Erhöhung (Faktor):</label>
                                <input name={"firstBlindFactor"} className={"firstBlindFactor"} key={this.props.config.firstBlindFactor} type={"number"} min={1} defaultValue={this.props.config.firstBlindFactor} readOnly={!this.props.isRoomMaster}/>
                            </div>
                            <div className={"row"}>
                                <label>2. Blind Erhöhung (Runden):</label>
                                <input name={"secondBlindRaise"} className={"secondBlindRaise"} key={this.props.config.secondBlindRaise} type={"number"} min={2} defaultValue={this.props.config.secondBlindRaise} readOnly={!this.props.isRoomMaster}/>
                            </div>
                            <div className={"row"}>
                                <label>2. Blind Erhöhung (Faktor):</label>
                                <input name={"secondBlindFactor"} className={"secondBlindFactor"} key={this.props.config.secondBlindFactor} type={"number"} min={1} defaultValue={this.props.config.secondBlindFactor}
                                       readOnly={!this.props.isRoomMaster}/>
                            </div>
                        </div>
                        {this.props.isRoomMaster ? <button className={"startGameButton"} type={"submit"}>Spiel Starten</button> : null}
                    </fieldset>
                </form>
            </div>
        </div>;
    }
}