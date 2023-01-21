import React, {ReactNode} from "react";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleApi from "../../framework/modules/ModuleApi";
import poker from "./Poker";
import {PokerGameState, PokerPhase} from "./PokerTypes";
import PokerConfig from "./components/PokerConfig";
import {EventDataObject} from "../../framework/modules/api/ModuleEventApi";
import PokerTable from "./components/PokerTable";

export default class PokerGame extends React.Component<{}, PokerGameState> implements ModuleGameInterface {

    private readonly api: ModuleApi;

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
        running: false,
        handCards: null,
        phase: PokerPhase.PREFLOP,
        players: [],
        communityCards: []
    }

    constructor(props: any) {
        super(props);
        this.api = new ModuleApi(poker, this);
    }

    // this method is called, once the component is ready and setState can be used
    componentDidMount(): void {
        this.api.getEventApi().addEventHandler("updateGameState", this.onUpdateGameState.bind(this))
        this.api.getEventApi().sendMessageToServer("requestGameState")
    }

    componentWillUnmount() {
        this.api.getEventApi().removeEvent("updateGameState")
    }

    private onUpdateGameState(eventData: EventDataObject) {
        this.api.getLogger().debug("Received new game state:", eventData)
        this.setState({
            config: eventData.config,
            round: eventData.round,
            running: eventData.running,
            handCards: eventData.handCards,
            phase: eventData.phase,
            players:eventData.players,
            communityCards:eventData.communityCards
        })
    }

    render(): ReactNode {
        return (
            <div id={"poker"}>
                <PokerTable isRunning={this.state.running} handCards={this.state.handCards} round={this.state.round} phase={this.state.phase} running={this.state.running} api={this.api} players={this.state.players} communityCards={this.state.communityCards}/>
                <PokerConfig config={this.state.config} api={this.api} isRoomMaster={this.api.getPlayerApi().isRoomMaster()} showOverlay={!this.state.running}/>
            </div>
        );
    }
}