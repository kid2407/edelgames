import React, {Component} from "react";
import {drawingModes, predefinedColors} from "../../../framework/components/DrawingCanvas/DrawingCanvas";

interface IProps {
    onChangeMode: (newMode: drawingModes) => void,
    onChangeWeight: (newWeight: number) => void,
    onChangeColor: (newColor: string) => void,

    currentMode: drawingModes,
    currentWeight: number,
    currentColor: string
}

export default class DrawingUtils extends Component<IProps, {}> {

    render() {
        return (
            <div className={"drawing-utils"}>

                <div className={"util-mode"}>
                    <span onClick={() => this.props.onChangeMode(drawingModes.DRAW)}>Draw</span>
                    <span onClick={() => this.props.onChangeMode(drawingModes.FILL)}>Fill</span>
                    <span onClick={() => this.props.onChangeMode(drawingModes.ERASE)}>Erase</span>
                </div>

                <div className={"util-drawing-weight"}>
                    <input type={"range"} min={1} max={30} value={this.props.currentWeight}
                           onChange={(event) => this.props.onChangeWeight(parseInt(event.target.value))}/>
                </div>

                <div className={"util-color"}>
                    {predefinedColors.map(color =>
                        <span className={"color-badge"}
                              key={color}
                              style={{
                                  backgroundColor: color,
                                  borderColor: color === this.props.currentColor ? 'white' : 'black'
                              }}
                              onClick={() => this.props.onChangeColor(color)}></span>
                    )}
                </div>
            </div>
        );
    }

}