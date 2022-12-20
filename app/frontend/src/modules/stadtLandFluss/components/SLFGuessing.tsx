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

    private blurTimeout: NodeJS.Timeout | null = null

    private sendGuessesToServer(ready: boolean) {
        // @ts-ignore
        let guessInputs = document.getElementById("slfGuessing").getElementsByTagName("input")
        let guesses = []
        for (let i = 0; i < guessInputs.length; i++) {
            // @ts-ignore
            guesses.push(guessInputs.item(i).value.trim())
        }

        console.log(guesses)
        this.props.gameApi.sendMessageToServer("updateGuesses", {guesses: guesses, ready: ready})
    }

    private onBlur() {
        if (this.blurTimeout !== null) {
            clearTimeout(this.blurTimeout)
        }
        this.blurTimeout = setTimeout(this.sendGuessesToServer.bind(this, false), 2500)
    }

    private onSubmitGuesses() {
        if (this.blurTimeout !== null){
            clearTimeout(this.blurTimeout)
        }
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
            this.sendGuessesToServer(true)
        }
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
                        <td><input onBlur={this.onBlur.bind(this)} type={"text"} key={`${profileManager.getId()}_${this.props.letter}_${c}`} defaultValue={this.props.guesses[profileManager.getId()]?.[this.props.letter]?.[c]}/></td>
                    </tr>)}
                </tbody>
            </table>
            <br/>
            <button id={"submitGuesses"} onClick={this.onSubmitGuesses.bind(this)}>Fertig! ({this.props.ready_users} von {this.props.user_count})</button>
        </div>);
    }
}