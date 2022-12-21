import {Component} from "react";
import roomManager from "../../../framework/util/RoomManager";
import {EndResultProps} from "../SLFTypes";

/**
 * Component for the end result screen.
 */
export default class SLFEndResults extends Component<EndResultProps, {}> {

    /**
     * Calculate the sorted and grouped data for the end results.
     */
    private getEndResultData(): { place: number, userId: string, username: string, points: number }[] {
        let roomMembers = roomManager.getRoomMembers()
        let finalData: { [userId: string]: { place: number, userId: string, username: string, points: number } } = {}

        Object.values(this.props.points).forEach(value => Object.values(value).forEach(data => {
            for (let [userId, points] of Object.entries(data)) {
                finalData[userId] = {
                    userId: userId,
                    username: finalData[userId]?.username ?? roomMembers.find(u => u.getId() === userId)?.getUsername(),
                    place: 0,
                    points: (finalData[userId]?.points ?? 0) + points
                }
            }
        }))

        let finalDataAsArray = Object.values(finalData)
        finalDataAsArray.sort((a, b) => Math.sign(b.points - a.points))
        finalDataAsArray.forEach((e, i) => e.place = i + 1)

        return finalDataAsArray
    }

    /**
     * Restart the game.
     */
    private restartGame() {
        this.props.gameApi.sendMessageToServer("playAgain", {})
    }

    /**
     * Render the component.
     */
    render() {
        return (<div id={"slfEndResult"}>
            <table>
                <thead>
                <tr>
                    <th>Platz</th>
                    <th>Spieler</th>
                    <th>Punkte</th>
                </tr>
                </thead>
                <tbody>
                {this.getEndResultData().map(d => <tr key={"endResultPlayer_" + d.userId}>
                    <td key={"endResultPlayer_" + d.userId + "_place"}>{d.place}</td>
                    <td key={"endResultPlayer_" + d.userId + "_username"}>{d.username}</td>
                    <td key={"endResultPlayer_" + d.userId + "_points"}>{d.points}</td>
                </tr>)}
                </tbody>
            </table>
            <br/>
            {this.props.isRoomMaster ? <button onClick={this.restartGame.bind(this)}>Nochmal spielen</button> : ""}
        </div>);
    }
}