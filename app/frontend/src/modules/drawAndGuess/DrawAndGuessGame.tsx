import React, {ReactNode} from "react";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleGameApi, {EventHandlerFunctionStack} from "../../framework/modules/ModuleGameApi";
import drawAndGuess from "./DrawAndGuess";
import DrawingCanvas, {
    canvasChangedEvent,
    drawingModes,
    eventTypes,
    predefinedColors
} from "../../framework/components/DrawingCanvas/DrawingCanvas";
import {EventDataObject} from "../../framework/util/EventManager";
import DrawingUtils from "./Components/DrawingUtils";
import ProfileManager from "../../framework/util/ProfileManager";
import RoomManager from "../../framework/util/RoomManager";
import User from "../../framework/util/User";
import ChatBox, {DAGChatMessage} from "./Components/ChatBox";

interface IState {
    currentMode: string,
    currentColor: string,
    currentWeight: number,
    activePlayerId: string|undefined,
    lastWord: string|undefined,
    totalScoreKey: number
}

export default class DrawAndGuessGame extends React.Component<{}, IState> implements ModuleGameInterface {

    private readonly gameApi: ModuleGameApi;
    private drawingCommandQueue: canvasChangedEvent[] = [];
    private scoreboard: {[key: string] : number} = {};
    private messageHistory: DAGChatMessage[] = [];

    eventHandlers: EventHandlerFunctionStack = {
        passiveCanvasChanged: this.onCanvasChangedRemote.bind(this),
        wordToGuessChanged: this.onWordToGuessChanged.bind(this),
        newGuessChatMessage: this.onNewGuessChatMessage.bind(this),
        activePlayerChanged: this.onActivePlayerChanged.bind(this),
        wordSelectionOptions: this.onWordSelectionOptions.bind(this),
        wordToDrawChanged: this.onWordToDrawChanged.bind(this),
        drawingSolution: this.onDrawingSolution.bind(this),
    }

    state = {
        currentMode: drawingModes.DRAW,
        currentColor: predefinedColors[0],
        currentWeight: 10,
        activePlayerId: undefined,
        lastWord: undefined,
        totalScoreKey: 0
    };

    constructor(props: any) {
        super(props);
        this.gameApi = new ModuleGameApi(drawAndGuess, this);
    }

    // this method is called, once the component is ready and setState can be used
    componentDidMount(): void {
        this.gameApi.addEventHandler('passiveCanvasChanged', this.eventHandlers.passiveCanvasChanged);
        this.gameApi.addEventHandler('wordToGuessChanged', this.eventHandlers.wordToGuessChanged);
        this.gameApi.addEventHandler('newGuessChatMessage', this.eventHandlers.newGuessChatMessage);
        this.gameApi.addEventHandler('activePlayerChanged', this.eventHandlers.activePlayerChanged);
        this.gameApi.addEventHandler('wordSelectionOptions', this.eventHandlers.wordSelectionOptions);
        this.gameApi.addEventHandler('wordToDrawChanged', this.eventHandlers.wordToDrawChanged);
        this.gameApi.addEventHandler('drawingSolution', this.eventHandlers.drawingSolution);
    }

    componentWillUnmount() {
        this.gameApi.removeEventHandler('passiveCanvasChanged', this.eventHandlers.passiveCanvasChanged);
        this.gameApi.removeEventHandler('wordToGuessChanged', this.eventHandlers.wordToGuessChanged);
        this.gameApi.removeEventHandler('newGuessChatMessage', this.eventHandlers.newGuessChatMessage);
        this.gameApi.removeEventHandler('activePlayerChanged', this.eventHandlers.activePlayerChanged);
        this.gameApi.removeEventHandler('wordSelectionOptions', this.eventHandlers.wordSelectionOptions);
        this.gameApi.removeEventHandler('wordToDrawChanged', this.eventHandlers.wordToDrawChanged);
        this.gameApi.removeEventHandler('drawingSolution', this.eventHandlers.drawingSolution);
    }

    /* ====================== */
    /* Remote Event Listeners */
    /* ====================== */

    onDrawingSolution(eventData: EventDataObject): void {
        let {solution, scoreboard, totalScoreKey} = eventData; // a string with the last word and the entire scoreboard to this point

        this.scoreboard = scoreboard as {[key: string]: number};

        this.addChatMessage(
            `Die Lösung war: ${solution}`,
            null,
            null,
            '#fff200'
        );

        this.setState({
            lastWord: solution,
            totalScoreKey: totalScoreKey
        });
    }

    onWordToDrawChanged(eventData: EventDataObject): void {
        let {word} = eventData; // a string with the word, that should be drawn

        // todo implement
    }

    onWordSelectionOptions(eventData: EventDataObject): void {
        let {options} = eventData; // an array of three strings

        // todo implement
    }

    onActivePlayerChanged(eventData: EventDataObject): void {
        let {activePlayer} = eventData; // the active player ID

        // clear canvas and delete old queued commands
        this.drawingCommandQueue = [{
            type: eventTypes.CLEAR,
            mode: drawingModes.CLEAR,
            color: '#000',
            weight: 1,
            x: 0, y: 0,
            px: 0, py: 0,
        }];

        let player = RoomManager.getRoomMembers().find(member => member.getId() === activePlayer);

        this.addChatMessage(
            `${player?.getUsername()} wählt ein Wort!`,
            null,
            null,
            '#fff200'
        );

        this.setState({
            activePlayerId: activePlayer
        });
    }

    onNewGuessChatMessage(eventData: EventDataObject): void {
        let {sender,    // sender ID
            text,       // message text
            timestamp,  // server timestamp
            color       // color string or null
        } = eventData;

        this.addChatMessage(text, sender, timestamp, color);
        this.setState({});
    }

    onWordToGuessChanged(eventData: EventDataObject): void {
        let {mask, timeUntil} = eventData; // a string containing the letter mask and the timestamp, when the drawing is over!
        // todo implement
    }

    onCanvasChangedRemote(event: EventDataObject): void {
        if(event && this.state.activePlayerId !== ProfileManager.getId()) {
            this.drawingCommandQueue.push(event as canvasChangedEvent);
        }
    }

    /* ====================== */
    /* Locale Event Listeners */
    /* ====================== */

    onMessageSend(message: string): void {
        this.gameApi.sendMessageToServer('attemptGuess', {
            guess: message
        });
    }

    onGetQueuedDrawCommands(): canvasChangedEvent[] {
        let queue = this.drawingCommandQueue.shift();
        return queue ? [queue] : [];
    }

    onCanvasChanged(event: canvasChangedEvent): void {
        this.gameApi.sendMessageToServer('activeCanvasChanged', {
            canvasChangedEvent: event
        });
    }

    onChangeColor(newColor: string): void {
        this.setState({currentColor: newColor});
    }

    onChangeWeight(newWeight: number): void {
        this.setState({currentWeight: newWeight});
    }

    onChangeMode(newMode: string): void {
        this.setState({currentMode: newMode});
    }

    /* ============== */
    /* Helper Methods */
    /* ============== */

    addChatMessage(message: string, sender: string|null, timestamp: number|null, color: string|null = null): void {
        this.messageHistory.push({
            text: message,
            sender: sender || 'system',
            timestamp: timestamp || Date.now(),
            color: color
        });
        if(this.messageHistory.length > 50) {
            this.messageHistory.shift(); // remove oldest element
        }
        // sort messages: oldest first
        this.messageHistory = this.messageHistory.sort((a,b) => b.timestamp - a.timestamp);
    }

    /* ============== */
    /* Render Methods */
    /* ============== */

    renderPlayerListElement(user: User): JSX.Element {
        let isActivePlayer = this.state.activePlayerId === user.getId();

        return (
            <div key={user.getId()}>
                <span>{user.getUsername()}</span>
                <span>{isActivePlayer ? '[drawing]' : ''}</span>
                <span>{this.scoreboard[user.getId()] || 0}</span>
            </div>
        );
    }

    render(): ReactNode {
        let allowDrawing = this.state.activePlayerId === ProfileManager.getId();
        console.log('allowDrawing', allowDrawing, this.state.activePlayerId, ProfileManager.getId());

        return (
            <div id={"drawAndGuess"} key={"drawAndGuess"}>
                <div className={"player-list"}>
                    <div key={this.state.totalScoreKey}>
                        {RoomManager.getRoomMembers().map(this.renderPlayerListElement.bind(this))}
                    </div>
                </div>
                <div className={"drawing-board"}>

                    <DrawingCanvas
                        drawingMode={this.state.currentMode}
                        drawingColor={this.state.currentColor}
                        drawingWeight={this.state.currentWeight}
                        enableManualDrawing={allowDrawing}
                        gatherDrawCommandCallback={this.onGetQueuedDrawCommands.bind(this)}
                        onCanvasChanged={this.onCanvasChanged.bind(this)}
                    />
                    {!allowDrawing ? null :
                        <DrawingUtils
                            currentMode={this.state.currentMode}
                            currentWeight={this.state.currentWeight}
                            currentColor={this.state.currentColor}
                            onChangeMode={this.onChangeMode.bind(this)}
                            onChangeWeight={this.onChangeWeight.bind(this)}
                            onChangeColor={this.onChangeColor.bind(this)}
                        />
                    }
                </div>
                <div className={"guessing-chat"}>
                    <ChatBox onSendCallback={this.onMessageSend.bind(this)}
                             messageHistory={this.messageHistory} />
                </div>
            </div>
        );
    }

}