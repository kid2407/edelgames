import {Component} from "react";
import ModuleGameApi from "../../../framework/modules/ModuleGameApi";
import profileManager from "../../../framework/util/ProfileManager";

export default class SLFGuessing extends Component<{ isRoomMaster: boolean, gameApi: ModuleGameApi, categories: string[],letter:string, guesses: { user: string, data: { letter: string, guesses: string[] }[] }[] }, {}> {

    generateTableHead() {
        return [<th>Buchstabe</th>, this.props.categories.map(c => <th>{c}</th>)]
    }

    getGuessesForUserByLetters(): { letter: string, guesses: string[] }[] {
        let forUser = this.props.guesses.find(g => g.user === profileManager.getId())
        if (typeof forUser !== "undefined") {
            return forUser.data
        }
        return []
    }

    generateTableBody() {
        let guessesFromUser = this.getGuessesForUserByLetters()
        return [
            guessesFromUser.map(g =>
                <tr>
                    <td>{g.letter}</td>
                    {g.guesses.map(l => <td>{l}</td>)}
                </tr>
            ),
            <tr>
                <td key={this.props.letter}>{this.props.letter}</td>
                {[...Array(this.props.categories.length-1)].map(() => <td><input type={"text"}/></td>)}
                <td><input type={"text"}/></td>
            </tr>]
    }

    render() {
        return (<div id={"slfGuessing"}>
            <table>
                <thead>
                <tr>
                    {this.generateTableHead()}
                </tr>
                </thead>
                <tbody>
                {this.generateTableBody()}
                </tbody>
            </table>
        </div>);
    }
}