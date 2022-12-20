import React, {ReactNode} from "react";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleGameApi from "../../framework/modules/ModuleGameApi";
import drawAndGuess from "./DrawAndGuess";
import Sketch from "react-p5";
import DrawingCanvas, {predefinedColors} from "../../framework/components/DrawingCanvas/DrawingCanvas";


interface IState {
    currentMode: string,
    currentColor: string,
    currentWeight: number,
}

export default class DrawAndGuessGame extends React.Component<{}, IState> implements ModuleGameInterface {

    private readonly gameApi: ModuleGameApi;

    constructor(props: any) {
        super(props);
        this.gameApi = new ModuleGameApi(drawAndGuess, this);
    }

    // this method is called, once the component is ready and setState can be used
    componentDidMount(): void {
        // this.gameApi.addEventHandler('serverMessageSend', this.onReceiveMessage.bind(this));
    }





    onChangeColor(newColor: string): void {
        this.setState({currentColor: newColor});
    }

    onChangeWeight(event: {[key: string]: any}): void {
        this.setState({currentWeight: event.target.value});
    }

    onChangeMode(newMode: string): void {
        this.setState({currentMode: newMode});
    }

    render(): ReactNode {
        return (
            <div id={"drawAndGuess"}>
                <div className={"drawing-board"}>

                    <DrawingCanvas />

                    <div className={"drawing-utils"}>

                        <div className={"util-mode"}>
                            <span onClick={this.onChangeMode.bind(this, 'draw')}>Draw</span>
                            <span onClick={this.onChangeMode.bind(this, 'fill')}>Fill</span>
                            <span onClick={this.onChangeMode.bind(this, 'erase')}>Erase</span>
                        </div>

                        <div className={"util-drawing-weight"}>
                            <input type={"range"} min={1} max={30} value={this.state.currentWeight} onChange={this.onChangeWeight.bind(this)}/>
                        </div>

                        <div className={"util-color"}>
                            {predefinedColors.map(color =>
                                <span className={"color-badge"}
                                      key={color}
                                      style={{
                                          backgroundColor: color,
                                          borderColor: color === this.state.currentColor ? 'white' : 'black'
                                      }}
                                      onClick={this.onChangeColor.bind(this, color)}></span>
                            )}
                        </div>

                    </div>
                </div>
                <div className={"guessing-chat"}>

                </div>
            </div>
        );
    }

}