import {Component} from "react";
import Dice from "./Dice";

interface IProps {
    rollIndex: number, // if this changed, the dices should be updated with an animation (dont change it for a slow turn)
    nextRollResults: number[], // determines the value of the dices
    diceToRollMask?: boolean[], // determines which of the dices should roll
    highlightColors?: (string|undefined)[], // determines if and which backdrop color each dice should have
    onEveryDiceRolled?: {(): void} // triggered once for every rolled dice
    onDicesRolled?: {(): void} // triggered once, when any dices changed
    onDicesClicked?: {(diceId: number): void} // triggered once, when any dices is clicked
}

// massive credit and thank you for this incredible dice roll WITH PLAIN CSS and as little JavaScript as imaginable
// to https://codesandbox.io/u/ryancperry
export default class DiceBox extends Component<IProps, {}> {

    // prevent unintended animations or doubled renders with this number
    lastRollIndex: number = 0;
    // keep track to correctly animate the roll
    numberOfRollsPerDice: number[] = [];

    render() {
        let diceCount = this.props.nextRollResults.length;

        if(this.lastRollIndex !== this.props.rollIndex) {
            this.lastRollIndex = this.props.rollIndex;

            // update dice roll counters to trigger an animation
            let dicesToRoll = this.props.diceToRollMask ? this.props.diceToRollMask : Array(diceCount).fill(true);
            dicesToRoll.forEach((rollDice, index) => {
                if(rollDice) {
                    let oldNum = this.numberOfRollsPerDice[index]===undefined ? 0 : this.numberOfRollsPerDice[index];
                    this.numberOfRollsPerDice[index] = oldNum + 1;
                }
            })

            if(this.props.onDicesRolled) {
                // @ts-ignore
                setTimeout(() => this.props.onDicesRolled(dicesToRoll, this.props.nextRollResults), 1500);
            }
        }

        return (
            <div className={"dice-box"}>
                {[...Array(diceCount)].map(this.renderDice.bind(this))}
            </div>
        );
    }

    renderDice(el: undefined, index: number): JSX.Element {
        return (
            <Dice key={index}
                  id={index}
                  nextRollResult={this.props.nextRollResults[index]}
                  onDiceRolled={this.props.onEveryDiceRolled?.bind(index)}
                  rollCount={this.numberOfRollsPerDice[index]||0}
                  onDiceClicked={this.props.onDicesClicked}
                  backdropColor={this.props.highlightColors ? this.props.highlightColors[index] : undefined}
            />
        );
    }
}