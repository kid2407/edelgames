import {Component} from "react";
import RangeSlider, {renderPreviewMethods} from "../../../framework/components/Inputs/RangeSlider";


export type GameConfigObject = {
    drawingTime: number,
    choosingTime: number,
    maxHints: number,
    rounds: number,
}

interface IProps {
    onSubmit: ((configuration: GameConfigObject) => void),
    onChange: ((configuration: GameConfigObject) => void),
    allowChanges: boolean,
    defaultConfig: null|Partial<GameConfigObject>
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

    componentDidMount() {
        if(this.props.defaultConfig) {
            this.setState(this.props.defaultConfig as IState);
        }
    }

    onAfterStateChanged(): void {
        this.props.onChange(this.state);
    }

    render() {
        return (
            <div className={"game-config"}>

                {this.renderRangeSliderConfig('Zeichen-Zeit',
                    this.props.defaultConfig?.drawingTime ?? this.state.drawingTime,
                    15, 300,
                    ((value: number) => this.setState({drawingTime: value}, this.onAfterStateChanged.bind(this))),
                    renderPreviewMethods.seconds
                )}

                {this.renderRangeSliderConfig('Wort-Auswahl-Zeit',
                    this.props.defaultConfig?.choosingTime ?? this.state.choosingTime,
                    5, 60,
                    ((value: number) => this.setState({choosingTime: value}, this.onAfterStateChanged.bind(this))),
                    renderPreviewMethods.seconds
                )}

                {this.renderRangeSliderConfig('Maximale Hinweise (%)',
                    this.props.defaultConfig?.maxHints ?? this.state.maxHints,
                    0, 100,
                    ((value: number) => this.setState({maxHints: value}, this.onAfterStateChanged.bind(this))),
                    renderPreviewMethods.percent
                )}

                {this.renderRangeSliderConfig('Anzahl Runden',
                    this.props.defaultConfig?.rounds ?? this.state.rounds,
                    1, 10,
                    (value: number) => this.setState({rounds: value}, this.onAfterStateChanged.bind(this))
                )}

                <div>
                    <button onClick={() => this.props.onSubmit(this.state)}>Start!</button>
                </div>
            </div>
        );
    }

    renderRangeSliderConfig(title: string, defaultValue: number, min: number, max: number, onChange: (value:number) => void, renderPreview: undefined|((value: number) => string|number|JSX.Element) = undefined): JSX.Element {
        return (
            <div className={"config-box"}>
                <div className={"config-name"}>{title}:</div>
                <div className={"config-field"}>
                    <RangeSlider defaultValue={defaultValue}
                                 min={min} max={max}
                                 onChange={onChange}
                                 disabled={!this.props.allowChanges}
                                 renderPreview={renderPreview}/>
                </div>
            </div>
        );
    }

}