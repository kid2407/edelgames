import {Component} from "react";
import {Guesses} from "../StadtLandFlussGame";
import roomManager from "../../../framework/util/RoomManager";
import ModuleGameApi from "../../../framework/modules/ModuleGameApi";

type RoundResultProps = {
    isRoomMaster: boolean
    gameApi: ModuleGameApi
    round: number,
    max_rounds: number
    letter: string,
    players: string[],
    guesses: Guesses,
    categories: string[]
}

export default class SLFRoundResults extends Component<RoundResultProps, {}> {

    private onNextRound() {
        this.props.gameApi.sendMessageToServer("nextRound", {})
    }

    render() {
        return (
            <div id={"slfRoundResults"}>
                <p>Ergebnisse für Runde {this.props.round} von {this.props.max_rounds} | Buchstabe: {this.props.letter}</p>
                <br/>
                <table>
                    <thead>
                    <tr>
                        <th>Kategorie</th>
                        {this.props.players.map(p => <th>{roomManager.getRoomMembers().find(u => u.getId() === p)?.getUsername()}</th>)}
                    </tr>
                    </thead>
                    <tbody>
                    {this.props.categories.map((c, i) => <tr>
                        <td>{c}</td>
                        {this.props.players.map(id => <td key={`guess_${id}_${this.props.letter}_${i}`}>{this.props.guesses[id]?.[this.props.letter]?.[i]}</td>)}
                    </tr>)}
                    </tbody>
                </table>
                <br/>
                {this.props.isRoomMaster ? <button onClick={this.onNextRound.bind(this)}>{this.props.round == this.props.max_rounds ? "Zum Endergebnis" : "Nächste Runde"}</button> : ""}
            </div>
        );
    }
}