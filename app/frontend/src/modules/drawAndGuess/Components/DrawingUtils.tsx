import React, {Component} from "react";
import {drawingModes, predefinedColors} from "../../../framework/components/DrawingCanvas/DrawingCanvas";
import RangeSlider from "../../../framework/components/Inputs/RangeSlider";

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
                <div className={"left-side"}>
                    <div className={"util-mode"}>
                    <span className={this.props.currentMode === drawingModes.DRAW ? 'active' : undefined}
                          onClick={() => this.props.onChangeMode(drawingModes.DRAW)}>Draw</span>
                        <span className={this.props.currentMode === drawingModes.FILL ? 'active' : undefined}
                              onClick={() => this.props.onChangeMode(drawingModes.FILL)}>Fill</span>
                        <span className={this.props.currentMode === drawingModes.ERASE ? 'active' : undefined}
                              onClick={() => this.props.onChangeMode(drawingModes.ERASE)}>Erase</span>
                    </div>

                    <div className={"util-drawing-weight"}>
                        <RangeSlider onChange={this.props.onChangeWeight}
                                     defaultValue={this.props.currentWeight}
                                     min={1} max={40}
                                     renderPreview={(value: number) => <span className={"weight-preview"} style={{width: value, height: value}}></span>}
                        />
                    </div>
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