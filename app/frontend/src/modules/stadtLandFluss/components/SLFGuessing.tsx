import {Component} from "react";
import ModuleGameApi from "../../../framework/modules/ModuleGameApi";
import profileManager from "../../../framework/util/ProfileManager";
import {Guesses} from "../StadtLandFlussGame";

type PropData = {
    isRoomMaster: boolean,
    gameApi: ModuleGameApi,
    categories: string[],
    letter: string,
    guesses: Guesses,
    round: number,
    max_rounds: number
}

export default class SLFGuessing extends Component<PropData, {}> {

    generateTableHead() {
        return [<th>Buchstabe</th>, this.props.categories.map(c => <th>{c}</th>)]
    }

    getGuessesForUserByLetters(): { [letter: string]: string[] } {
        let forUser = this.props.guesses[profileManager.getId()]
        if (typeof forUser !== "undefined") {
            return forUser
        }
        return {}
    }

    generateTableBody() {
        let letter: string, guessesPerLetter: string[]
        let generateTable = []
        let foundDataForCurrentLetter = false
        let guessesFromUser = this.getGuessesForUserByLetters()

        for (letter in guessesFromUser) {
            if (guessesFromUser.hasOwnProperty(letter)) {
                guessesPerLetter = guessesFromUser[letter]
                if (letter === this.props.letter) {
                    generateTable.push(
                        <tr>
                            <td key={this.props.letter}>{this.props.letter}</td>
                            {Object.values(guessesPerLetter).map((guess, i) => <td key={this.props.letter + i}><input defaultValue={guess}/></td>)}
                        </tr>
                    )
                    foundDataForCurrentLetter = true
                } else {
                    generateTable.push(
                        <tr>
                            <td>{letter}</td>
                            {Object.values(guessesPerLetter).map(guess => <td>{guess}</td>)}
                        </tr>
                    )
                }
            }
        }

        if (!foundDataForCurrentLetter) {
            generateTable.push(
                <tr>
                    <td key={this.props.letter}>{this.props.letter}</td>
                    {[...Array(this.props.categories.length - 1)].map(() => <td><input type={"text"}/></td>)}
                    <td><input type={"text"}/></td>
                </tr>
            )
        }

        return generateTable
    }

    private onUpdateGuesses() {
        // @ts-ignore
        let guessInputs = document.getElementById("slfGuessing").getElementsByTagName("input")
        let guesses = []
        for (let i = 0; i < guessInputs.length; i++) {
            // @ts-ignore
            guesses.push(guessInputs.item(i).value.trim())
        }

        console.log(guesses)
        this.props.gameApi.sendMessageToServer("updateGuesses", {guesses: guesses})
    }

    private onNextRound() {
        this.onUpdateGuesses()
        this.props.gameApi.sendMessageToServer("beginRound", {})
    }

    render() {
        return (<div id={"slfGuessing"}>
            <p>Runde {this.props.round} von {this.props.max_rounds}</p>
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
            <br/>
            <button onClick={this.onUpdateGuesses.bind(this)}>Eingaben speichern</button>
            &nbsp;
            <button onClick={this.onNextRound.bind(this)}>Nächste Runde</button>
        </div>);
    }
}