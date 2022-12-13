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
    max_rounds: number,
    ready_users: number,
    user_count: number
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
        let guessInputCollection: HTMLCollectionOf<HTMLInputElement> = document.getElementById("slfGuessing")?.getElementsByTagName("input") as HTMLCollectionOf<HTMLInputElement>
        let button: HTMLButtonElement = document.getElementById("submitGuesses") as HTMLButtonElement

        if (button.classList.contains("submitted")) {
            button.classList.remove("submitted")
            for (let i = 0; i < guessInputCollection.length; i++) {
                guessInputCollection.item(i)?.classList.remove("blocked")
            }
            this.props.gameApi.sendMessageToServer("unready", {})

        } else {
            button.classList.add("submitted")
            for (let i = 0; i < guessInputCollection.length; i++) {
                guessInputCollection.item(i)?.classList.add("blocked")
            }
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
    }

    private onNextRound() {
        this.onUpdateGuesses()
        this.props.gameApi.sendMessageToServer("beginRound", {})
    }

    render() {
        return (<div id={"slfGuessing"}>
            <p>Runde {this.props.round} von {this.props.max_rounds}</p>
            <p>Buchstabe: {this.props.letter}</p>
            <table>
                <thead>
                <tr>
                    <th>Kategorie</th>
                    <th>Deine Antwort</th>
                </tr>
                </thead>
                <tbody>
                {this.props.categories.map((c: string) =>
                    <tr>
                        <td>{c}</td>
                        {/* @ts-ignore */}
                        <td><input type={"text"} key={`${profileManager.getId()}_${this.props.letter}_${c}`} defaultValue={this.props.guesses[profileManager.getId()]?.[this.props.letter]?.[c]}/></td>
                    </tr>)}
                {/*{this.generateTableBody()}*/}
                </tbody>
            </table>
            <br/>
            <button id={"submitGuesses"} onClick={this.onUpdateGuesses.bind(this)}>Fertig! ({this.props.ready_users} von {this.props.user_count})</button>
        </div>);
    }
}