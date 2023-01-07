import React, {ReactNode} from "react";
import ModuleInterface from "../../modules/ModuleInterface";
import roomManager from "../../util/RoomManager";
import profileManager from "../../util/ProfileManager";
import socketManager from "../../util/SocketManager";
import moduleRegistry from "../../modules/ModuleRegistry";
import Sketch from "react-p5";
import p5Types from "p5";


export enum drawingModes {
    DRAW = 'draw',
    ERASE = 'erase',
    FILL = 'fill',
    CLEAR = 'clear',
}

export enum eventTypes {
    POINT = 'point',
    LINE = 'line',
    FILL = 'fill',
    CLEAR = 'clear'
}

export type canvasChangedEvent = {
    type: eventTypes,
    mode: drawingModes,
    weight: number,
    color: string,
    x: number,
    y: number,
    px: number|undefined,
    py: number|undefined
}

interface IProps {
    drawFunction: (p5: p5Types) => {} | undefined;
    setupFunction: (p5: p5Types) => {} | undefined;
    backgroundColor: string;
    onCanvasChanged: (event: canvasChangedEvent) => void;
    gatherDrawCommandCallback: () => canvasChangedEvent[];
    drawingMode: drawingModes;
    drawingColor: string;
    drawingWeight: number;
    enableManualDrawing: boolean;
    canvasWidth: number;
    canvasHeight: number;
}

export default class DrawingCanvas extends React.Component<IProps, {}> {

    static defaultProps = {
        drawFunction: undefined,
        setupFunction: undefined,
        backgroundColor: '#bbb',
        onCanvasChanged: (event: canvasChangedEvent) => {},
        gatherDrawCommandCallback: () => [],
        drawingMode: drawingModes.DRAW,
        drawingColor: '#000',
        drawingWeight: 10,
        enableManualDrawing: true,
        canvasWidth: 700,
        canvasHeight: 500,
    };

    isEmptyCanvas: boolean = true;

    sketchSetup(p5: p5Types, canvasParentRef: Element) {
        p5.createCanvas(this.props.canvasWidth, this.props.canvasHeight).parent(canvasParentRef);
        p5.noStroke();
        p5.smooth();
        p5.background(this.props.backgroundColor);

        if(this.props.setupFunction) {
            this.props.setupFunction(p5);
        }
    }

    sketchDraw(p5: p5Types) {
        if(this.props.gatherDrawCommandCallback) {
            let drawEvents = this.props.gatherDrawCommandCallback();
            if(drawEvents && drawEvents.length) {
                for(let drawEvent of drawEvents) {
                    switch(drawEvent.type) {
                        case eventTypes.POINT:
                            this.drawPoint(p5, drawEvent.x, drawEvent.y, drawEvent.color, drawEvent.weight);
                            break;
                        case eventTypes.LINE:
                            this.drawLine(p5, drawEvent.px||0, drawEvent.py||0, drawEvent.x, drawEvent.y, drawEvent.color, drawEvent.weight);
                            break;
                        case eventTypes.FILL:
                            this.fillSimilarColors(p5, drawEvent.x, drawEvent.y, drawEvent.color);
                            break;
                        case eventTypes.CLEAR:
                            this.clearCanvas(p5);
                            break;
                    }
                }
            }
        }

        if(this.props.drawFunction) {
            this.props.drawFunction(p5);
        }
    }

    sketchMousePressed(p5: p5Types) {
        let {mouseX, mouseY} = p5;
        if(!this.props.enableManualDrawing || mouseX < 0 || mouseY < 0 || mouseX >= p5.width || mouseY >= p5.height) {
            return;
        }

        if(this.props.drawingMode === drawingModes.FILL) {
            this.props.onCanvasChanged({
                type: eventTypes.FILL,
                mode: this.props.drawingMode,
                color: this.props.drawingColor,
                weight: this.props.drawingWeight,
                x: mouseX,
                y: mouseY,
                px: undefined,
                py: undefined
            });
            this.fillSimilarColors(p5, mouseX, mouseY, this.props.drawingColor);
            return;
        }

        let color = this.props.drawingMode === drawingModes.ERASE ? this.props.backgroundColor : this.props.drawingColor;
        this.drawPoint(p5, mouseX, mouseY, color, this.props.drawingWeight);

        this.props.onCanvasChanged({
            type: eventTypes.POINT,
            mode: this.props.drawingMode,
            color: color,
            weight: this.props.drawingWeight,
            x: mouseX,
            y: mouseY,
            px: undefined,
            py: undefined
        });
    }

    sketchMouseDragged(p5: p5Types) {
        if(!this.props.enableManualDrawing || this.props.drawingMode === drawingModes.FILL) {
            return;
        }

        let {pmouseX, pmouseY, mouseX, mouseY} = p5;
        let color = this.props.drawingMode === drawingModes.ERASE ? this.props.backgroundColor : this.props.drawingColor;
        this.drawLine(p5, pmouseX, pmouseY, mouseX, mouseY, color, this.props.drawingWeight);

        this.props.onCanvasChanged({
            type: eventTypes.LINE,
            mode: this.props.drawingMode,
            color: color,
            weight: this.props.drawingWeight,
            x: mouseX,
            y: mouseY,
            px: pmouseX,
            py: pmouseY
        });
    }

    fillSimilarColors(p5: p5Types, x: number, y:number, color: string): void {
        if(x < 0 || y < 0 || x >= p5.width || y >= p5.height) {
            return;
        }

        if(this.isEmptyCanvas) {
            p5.background(color);
            return;
        }

        const pixelDensity = p5.pixelDensity();
        const width = p5.width * pixelDensity,
            height = p5.height * pixelDensity;

        const arraysEqual = (arr1: number[], arr2: number[]) => {
            return arr1.every((val: number, index: number) => val === arr2[index]);
        }

        let clickedPixel = {x: x * pixelDensity, y: y * pixelDensity};
        let clickedIndex = 4 * (clickedPixel.x + clickedPixel.y * width);
        let checkPixelStack: {x: number, y: number}[] = [clickedPixel];

        p5.loadPixels();

        const newColor = [
            p5.red(color),
            p5.green(color),
            p5.blue(color),
            p5.alpha(color)
        ]
        const oldColor = [
            p5.pixels[clickedIndex],
            p5.pixels[clickedIndex+1],
            p5.pixels[clickedIndex+2],
            p5.pixels[clickedIndex+3],
        ];

        let fillCounter = 0;
        const fillLimit = 10000000; // 10.000.000 // 1.397.601
        while(checkPixelStack.length && fillCounter < fillLimit) {
            // get one pixel from the stack and remove it
            let pixel = checkPixelStack.pop();

            if(!pixel) {
                continue;
            }
            let pixIndex = 4 * (pixel.x + pixel.y * width);

            fillCounter++;

            let pixColor = [
                p5.pixels[pixIndex],
                p5.pixels[pixIndex+1],
                p5.pixels[pixIndex+2],
                p5.pixels[pixIndex+3]
            ];

            // change color if necessary
            if(!arraysEqual(oldColor, pixColor)) {
                continue;
            }

            p5.pixels[pixIndex]   = newColor[0];
            p5.pixels[pixIndex+1] = newColor[1];
            p5.pixels[pixIndex+2] = newColor[2];
            p5.pixels[pixIndex+3] = newColor[3];

            // add surrounding pixels to the stack
            if(pixel.y > 0) {
                checkPixelStack.push({x: pixel.x   , y: (pixel.y-1)});
            }
            if(pixel.y < height-1) {
                checkPixelStack.push({x: pixel.x   , y: (pixel.y+1)});
            }
            if(pixel.x > 0) {
                checkPixelStack.push({x: (pixel.x-1)   , y: pixel.y});
            }
            if(pixel.x < width-1) {
                checkPixelStack.push({x: (pixel.x+1)   , y: pixel.y});
            }
        }

        console.log(`filled ${fillCounter} pixels`);
        p5.updatePixels(0,0, width, height);
        this.isEmptyCanvas = false;
    }

    drawLine(p5: p5Types, px: number, py: number, x: number, y: number, color: string, weight: number): void {
        p5.stroke(color);
        p5.strokeWeight(weight);
        p5.line(px,py,x,y);
        this.isEmptyCanvas = false;
    }

    drawPoint(p5: p5Types, x: number, y: number, color: string, weight: number): void {
        p5.strokeWeight(0);
        p5.fill(color);
        p5.circle(x, y, weight);
        this.isEmptyCanvas = false;
    }

    clearCanvas(p5: p5Types): void {
        p5.background(this.props.backgroundColor);
        this.isEmptyCanvas = true;
    }

    render(): ReactNode {
        return (
            <Sketch setup={this.sketchSetup.bind(this)}
                    draw={this.sketchDraw.bind(this)}
                    mouseClicked={this.sketchMousePressed.bind(this)}
                    mouseDragged={this.sketchMouseDragged.bind(this)}/>
        );
    }

}

export const predefinedColors = [
    '#000',
    '#333',
    '#666',
    '#fff',
    '#f00',
    '#f50',
    '#ff0',
    '#0f0',
    '#0e480e',
    '#0ff',
    '#00f',
    '#60f',
    '#f0f',
    '#572c1e',
];
