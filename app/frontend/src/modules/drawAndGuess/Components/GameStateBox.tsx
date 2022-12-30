import React, {Component, createRef, RefObject} from "react";
import RoomManager from "../../../framework/util/RoomManager";


interface IProps {
    isGuessing: boolean,
    wordMask: string|null,
    countdownUntil: number|null;
}

interface IState {
    timer: number
}

export default class GameStateBox extends Component<IProps,{}> {

    state = {
        timer: 0
    }


    tickInterval: NodeJS.Timer | undefined;
    timerUpdateInterval: number = 333;

    constructor(props: IProps) {
        super(props);
    }

    componentDidMount() {
        this.tickInterval = setInterval(this.updateTimer.bind(this), this.timerUpdateInterval);
    }

    componentWillUnmount() {
        clearInterval(this.tickInterval);
    }

    updateTimer() {
        if(!this.props.countdownUntil) {
            return;
        }

        const   now = Date.now(),
                remainingTime = this.props.countdownUntil - now;

        this.setState({
            timer: Math.floor(remainingTime / 1000)
        });
    }

    renderTimer(): JSX.Element|null {
        let deadline = this.props.countdownUntil;
        if(!deadline) {
            return null;
        }

        return (
            <div className={"countdown"}>{this.state.timer}</div>
        );
    }

    renderMaskedLetter(letter: string): JSX.Element {
        if(letter === '_') {
            return (
                <span className={'masked-letter'}>&nbsp;</span>
            );
        }
        else {
            return (
                <span className={'hint-letter'}>{letter}</span>
            );
        }
    }

    renderWordMask(): JSX.Element|null {
        let word = this.props.wordMask;
        if(!word) {
            return null;
        }

        return(
            <div className={"word-mask"}>
                {word.split('').map(this.renderMaskedLetter.bind(this))}
            </div>
        );
    }


    render() {
        return(
            <div className={"game-state-box"}>
                <div className={"game-state"}>
                    <div>
                        {this.props.isGuessing ? 'Finde' : 'Zeichne'} das Word:
                    </div>
                    {this.renderWordMask()}
                </div>
                <div className={"game-timer"}>
                    {this.renderTimer()}
                </div>
            </div>
        );
    }
}