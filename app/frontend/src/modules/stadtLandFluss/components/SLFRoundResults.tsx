import {Component, ReactNode} from "react";
import {Guesses, Points} from "../StadtLandFlussGame";
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
    categories: string[],
    points: Points
}

export default class SLFRoundResults extends Component<RoundResultProps, {}> {

    private onNextRound() {
        this.props.gameApi.sendMessageToServer("nextRound", {})
    }

    private sumPointsPerPlayerAndRound(): number[] {
        let summed: { [userId: string]: number } = {}

        for (let usersPointList of Object.values(this.props.points[this.props.letter])) {
            for (let [userId, pointAmount] of Object.entries(usersPointList)) {
                if (!summed.hasOwnProperty(userId)) {
                    summed[userId] = 0
                }
                summed[userId] += pointAmount
            }
        }


        return Object.values(summed)
    }

    render(): ReactNode {
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
                        {this.props.players.map(id => <td className={"points_" + this.props.points[this.props.letter]?.[i]?.[id]} key={`guess_${id}_${this.props.letter}_${i}`}>{this.props.guesses[id]?.[this.props.letter]?.[i]}</td>)}
                    </tr>)}
                    <tr className={"boldChildren"}>
                        <td>Punkte</td>
                        {this.sumPointsPerPlayerAndRound().map(p => <td>{p}</td>)}
                    </tr>
                    </tbody>
                </table>
                <br/>
                {this.props.isRoomMaster ? <button onClick={this.onNextRound.bind(this)}>{this.props.round == this.props.max_rounds ? "Zum Endergebnis" : "Nächste Runde"}</button> : ""}
            </div>
        );
    }
}