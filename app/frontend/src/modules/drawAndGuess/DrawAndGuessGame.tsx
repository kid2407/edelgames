import React, {ReactNode} from "react";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleGameApi from "../../framework/modules/ModuleGameApi";
import drawAndGuess from "./DrawAndGuess";
import Sketch from "react-p5";
import p5Types from "p5";


interface IState {
    currentMode: string,
    currentColor: string,
    currentWeight: number,
}

const backgroundColor = '#bbb';
const predefinedColors = [
    '#000',
    '#333',
    '#666',
    '#fff',
    '#f00',
    '#f50',
    '#ff0',
    '#0f0',
    '#0ff',
    '#00f',
    '#60f',
    '#f0f',
    '#572c1e',
];

export default class DrawAndGuessGame extends React.Component<{}, IState> implements ModuleGameInterface {

    private readonly gameApi: ModuleGameApi;

    state = {
        currentMode: "draw",
        currentColor: '#000',
        currentWeight: 10
    }

    constructor(props: any) {
        super(props);
        this.gameApi = new ModuleGameApi(drawAndGuess, this);
    }

    // this method is called, once the component is ready and setState can be used
    componentDidMount(): void {
        // this.gameApi.addEventHandler('serverMessageSend', this.onReceiveMessage.bind(this));
    }

    sketchSetup(p5: p5Types, canvasParentRef: Element): void {
        p5.createCanvas(700, 500).parent(canvasParentRef);
        p5.noStroke();
        p5.smooth();
        p5.background(backgroundColor);
    }

    sketchMousePressed(p5: p5Types) {
        let {mouseX, mouseY} = p5;

        if(this.state.currentMode === 'fill') {
            this.fillSimilarColors(p5, mouseX, mouseY);
            return;
        }

        p5.strokeWeight(0);
        switch(this.state.currentMode) {
            case 'erase':
                p5.fill(backgroundColor);
                break;
            case 'draw':
            default:
                p5.fill(this.state.currentColor);
                break;
        }
        p5.circle(mouseX, mouseY, this.state.currentWeight);
    }

    fillSimilarColors(p5: p5Types, x: number, y:number): void {
        if(x < 0 || y < 0 || x > p5.width || y > p5.height) {
            return;
        }


        let d = p5.pixelDensity();
        let isColorMatch = (col1: number[], col2: number[]) => {
            return     col1[0] === col2[0]
                    && col1[1] === col2[1]
                    && col1[2] === col2[2]
                    && col1[3] === col2[3]
        }
        let coordToIndex = (coord: {x: number, y: number}): number => {
            return (coord.x) + (coord.y * p5.height);
        }
        let indexToCoord = (index: number): {x: number, y: number} => {
            return {
                x: index%p5.height,
                y: Math.floor(index/p5.height)
            };
        }


        let visitedPixels: {[key:number]:boolean} = {};
        let checkPixelStack: number[] = [coordToIndex({x: x, y: y})];

        p5.loadPixels();

        let pIndex = 4 * (x * d) * (y * d);
        let oldColor = [
            p5.pixels[pIndex],   // red
            p5.pixels[pIndex+1], // green
            p5.pixels[pIndex+2], // blue
            p5.pixels[pIndex+3]  //alpha
        ];
        let newColor = [
            p5.red(this.state.currentColor),   // red
            p5.green(this.state.currentColor), // green
            p5.blue(this.state.currentColor), // blue
            p5.alpha(this.state.currentColor)  //alpha
        ]

        let fillCounter = 0;
        console.log('start filling', oldColor, newColor);
        while(checkPixelStack.length > 0 && fillCounter < 5000) {
            if(fillCounter%100 === 0) console.log('fill: ', fillCounter);

            // get one pixel from the stack and remove it
            let pixIndex = checkPixelStack.pop();
            if(!pixIndex) {
                continue;
            }

            // check if it has been checked before
            if(visitedPixels.hasOwnProperty(pixIndex)) {
               continue;
            }

            fillCounter++;

            let pix = indexToCoord(pixIndex);
            let pixColor = p5.get(pix.x,pix.y);

            // change color if necessary
            if(isColorMatch(oldColor, pixColor)) {
                p5.set(pix.x, pix.y, newColor);
            }
            else {
                visitedPixels[pixIndex] = true;
                continue;
            }

            // add surrounding pixels to the stack
            let north = pixIndex-(d*p5.height);
            let south = pixIndex+(d*p5.height);
            let west  = pixIndex-1;
            let east  = pixIndex+1;

            if(!visitedPixels.hasOwnProperty(north))
                checkPixelStack.push(north);
            if(!visitedPixels.hasOwnProperty(south))
                checkPixelStack.push(south);
            if(!visitedPixels.hasOwnProperty(west))
                checkPixelStack.push(west);
            if(!visitedPixels.hasOwnProperty(east))
                checkPixelStack.push(east);

            // mark pixel as checked before
            visitedPixels[pixIndex] = true;
        }
        console.log('stop filling');


        p5.updatePixels(0,0,p5.width, p5.height);
    }

    sketchMouseDragged(p5: p5Types) {
        if(this.state.currentMode === 'fill') {
            return;
        }

        let {pmouseX, pmouseY, mouseX, mouseY} = p5;
        p5.strokeWeight(this.state.currentWeight);

        switch(this.state.currentMode) {
            case 'erase':
                p5.stroke(backgroundColor);
                break;
            default:
                p5.stroke(this.state.currentColor);
                break;
        }
        p5.line(pmouseX, pmouseY, mouseX, mouseY);
    }

    sketchDrawLoop(p5: p5Types): void {}

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

                    <Sketch setup={this.sketchSetup.bind(this)}
                            draw={this.sketchDrawLoop.bind(this)}
                            mouseClicked={this.sketchMousePressed.bind(this)}
                            mouseDragged={this.sketchMouseDragged.bind(this)}/>

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