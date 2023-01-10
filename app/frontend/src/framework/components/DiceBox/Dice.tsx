import {Component} from "react";

interface IProps {
    nextRollResult: number,
    rollCount: number,
    onDiceRolled?: {(): void}
}

export default class Dice extends Component<IProps, {}> {

    lastRollCount: number = 0; // how many times the dice value has changed

    render() {
        if(this.lastRollCount !== this.props.rollCount) {
           this.lastRollCount = this.props.rollCount;
           if(this.props.onDiceRolled) {
               this.props.onDiceRolled();
           }
        }

        // switch between animations to cause a rapid spinning
        let rollClass = (this.lastRollCount%2 === 0) ? 'even' : 'odd';

        return (
            <div className={"dice"}>
                <ol className={`die-list ${rollClass}-roll`}
                    data-roll={this.props.nextRollResult}>
                    {[...Array(6)].map((el, index) => this.renderSide(index+1))}
                </ol>
            </div>
        );
    }

    renderSide(dotCount: number): JSX.Element {
        return (
            <li className={"die-item"} data-side={dotCount} key={'dice_side_'+dotCount}>
                {[...Array(dotCount)].map((el, index) => <span className="dot" key={'dice_side_'+dotCount+'_dot_'+index}></span>)}
            </li>
        );
    }
}