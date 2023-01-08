import React, {ReactNode} from "react";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleApi from "../../framework/modules/ModuleApi";
import poker from "./Poker";
import {PokerGameState} from "./PokerTypes";
import PokerConfig from "./components/PokerConfig";

export default class PokerGame extends React.Component<{}, PokerGameState> implements ModuleGameInterface {

    private readonly api: ModuleApi;
    private initialized: boolean = false;

    state = {
        config: {
            startingMoney: 1000,
            smallBlind: 5,
            bigBlind: 10,
            firstBlindRaise: 5,
            firstBlindFactor: 2,
            secondBlindRaise: 10,
            secondBlindFactor: 4
        },
        round: 0,
        running: false
    }

    constructor(props: any) {
        super(props);
        this.api = new ModuleApi(poker, this);
    }

    // this method is called, once the component is ready and setState can be used
    componentDidMount(): void {
        if (!this.initialized) {
            this.api.getEventApi().addEventHandler("updateGameState", this.onUpdateGameState.bind(this))
            this.initialized = true;
        }
    }

    private onUpdateGameState(eventData: PokerGameState | any): void {
        this.api.getLogger().debug("Received new game state:", eventData)
        this.setState({
            config: eventData.config,
            round: eventData.round,
            running: eventData.running
        })
    }

    renderPokerTable(): ReactNode {
        return <div className={"pokerTable"}></div>
    }

    renderSettingsOverlay(): ReactNode {
        return !this.state.running ? <PokerConfig config={this.state.config} api={this.api} isRoomMaster={this.api.getPlayerApi().isRoomMaster()}/> : null
    }

    render(): ReactNode {
        return (
            <div id={"poker"}>
                {this.renderPokerTable()}
                {this.renderSettingsOverlay()}
            </div>
        );
    }
}