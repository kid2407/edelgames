import {Component, ReactNode} from "react";
import roomManager from "../../../framework/util/RoomManager";
import profileManager from "../../../framework/util/ProfileManager";
import {RoundResultProps} from "../SLFTypes";

/**
 * Component for round results.
 */
export default class SLFRoundResults extends Component<RoundResultProps, {}> {

    /**
     * Start the next round.
     */
    private onNextRound(): void {
        this.props.gameApi.sendMessageToServer("nextRound", {})
    }

    /**
     * Calculate the point total per player for this round.
     */
    private sumPointsPerPlayer(): number[] {
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

    /**
     * Update the "downvote" for a given answer by a specific user.
     *
     * @param {string} userId
     * @param {number} categoryIndex
     */
    private toggleDownvote(userId: string, categoryIndex: number): void {
        let newState: boolean
        let button = document.getElementById(`toggleDownvote_${userId}_${categoryIndex}`)
        if (button) {
            if (button.classList.contains("active")) {
                newState = false
                button.classList.remove("active")
            } else {
                newState = true
                button.classList.add("active")
            }

            this.props.gameApi.sendMessageToServer("setDownvote", {userId: userId, categoryIndex: categoryIndex, isActive: newState})
        }
    }

    /**
     * Renders the component.
     */
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
                        {this.props.players.map(id =>
                            <td className={"points_" + this.props.points[this.props.letter]?.[i]?.[id]} key={`guess_${id}_${this.props.letter}_${i}`}>
                                {this.props.guesses[id]?.[this.props.letter]?.[i]}&nbsp;
                                {(id !== profileManager.getId() && this.props.points[this.props.letter]?.[i]?.[id] > 0) ?
                                    <button id={`toggleDownvote_${id}_${i}`}
                                            className={"downvoteButton" + (this.props.point_overrides[id]?.[i]?.includes(profileManager.getId()) ? " active" : "")}
                                            onClick={this.toggleDownvote.bind(this, id, i)}>Downvote ({this.props.point_overrides[id]?.[i]?.length ?? 0}/{this.props.players.length - 1})
                                    </button> : ""}
                            </td>
                        )}
                    </tr>)}
                    <tr className={"boldChildren"}>
                        <td>Punkte</td>
                        {this.sumPointsPerPlayer().map(p => <td>{p}</td>)}
                    </tr>
                    </tbody>
                </table>
                <br/>
                {this.props.isRoomMaster ? <button onClick={this.onNextRound.bind(this)}>{this.props.round === this.props.max_rounds ? "Zum Endergebnis" : "Nächste Runde"}</button> : ""}
            </div>
        );
    }
}