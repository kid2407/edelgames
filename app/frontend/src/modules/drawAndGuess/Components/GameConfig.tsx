import {Component} from "react";
import RangeSlider from "../../../framework/components/Inputs/RangeSlider";


export type GameConfigObject = {
    drawingTime: number,
    choosingTime: number,
    maxHints: number,
    rounds: number,
}

interface IProps {
    onSubmit: (configuration: GameConfigObject) => void,
    allowChanges: boolean
}

interface IState {
    drawingTime: number,
    choosingTime: number,
    maxHints: number,
    rounds: number,
}

export default class GameConfig extends Component<IProps, IState> {

    state = {
        drawingTime: 100,
        choosingTime: 10,
        maxHints: 75,
        rounds: 5,
    }

    render() {
        return (
            <div className={"game-config"}>

                <div className={"config-box"}>
                    <div className={"config-name"}>Zeichen-Zeit:</div>
                    <div className={"config-field"}>
                        <RangeSlider defaultValue={this.state.drawingTime}
                                     min={15} max={300}
                                     onChange={(value) => this.setState({drawingTime: value})}
                                     renderPreview={(value) => value+'s'}
                        />
                    </div>
                </div>

                <div className={"config-box"}>
                    <div className={"config-name"}>Wort-Auswahl-Zeit:</div>
                    <div className={"config-field"}>
                        <RangeSlider defaultValue={this.state.choosingTime}
                                     min={5} max={60}
                                     onChange={(value) => this.setState({choosingTime: value})}
                                     renderPreview={(value) => value+'s'}
                        />
                    </div>
                </div>

                <div className={"config-box"}>
                    <div className={"config-name"}>Maximale Hinweise (%):</div>
                    <div className={"config-field"}>
                        <RangeSlider defaultValue={this.state.maxHints}
                                     min={0} max={100}
                                     onChange={(value) => this.setState({maxHints: value})}
                                     renderPreview={(value) => value+'%'}
                        />
                    </div>
                </div>

                <div className={"config-box"}>
                    <div className={"config-name"}>Anzahl Runden:</div>
                    <div className={"config-field"}>
                        <RangeSlider defaultValue={this.state.rounds}
                                     min={1} max={10}
                                     onChange={(value) => this.setState({rounds: value})} />
                    </div>
                </div>


                <div>
                    <button onClick={() => this.props.onSubmit(this.state)}>Start!</button>
                </div>
            </div>
        );
    }

}