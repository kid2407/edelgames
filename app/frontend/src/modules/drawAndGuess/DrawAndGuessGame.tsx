import React, {ReactNode} from "react";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
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
import ChatBox, {DAGChatMessage} from "./Components/ChatBox";
import GameStateBox from "./Components/GameStateBox";
import GameConfig, {GameConfigObject} from "./Components/GameConfig";
import WordSelection from "./Components/WordSelection";
import ModuleApi from "../../framework/modules/ModuleApi";

interface IState {
    currentMode: string,
    currentColor: string,
    currentWeight: number,
    activePlayerId: string|undefined,
    lastWord: string|undefined,
    currentMask: string|null,
    currentWord: string|null,
    currentWordOptions: string[],
    timerUntil: number|null,
    currentGameState: string,
    defaultConfig: {[key: string]: any}|null,
}

export default class DrawAndGuessGame extends React.Component<{}, IState> implements ModuleGameInterface {

    private readonly api: ModuleApi;
    private drawingCommandQueue: canvasChangedEvent[] = [];
    private scoreboard: {[key: string] : number} = {};
    private messageHistory: DAGChatMessage[] = [];

    state = {
        currentMode: drawingModes.DRAW,
        currentColor: predefinedColors[0],
        currentWeight: 10,
        activePlayerId: undefined,
        lastWord: undefined,
        currentMask: null,
        currentWord: null,
        currentWordOptions: [],
        timerUntil: null,
        currentGameState: 'configuration',
        defaultConfig: null
    };

    constructor(props: any) {
        super(props);
        this.api = new ModuleApi(drawAndGuess, this);
    }

    // this method is called, once the component is ready and setState can be used
    componentDidMount(): void {
        this.api.getEventApi().addEventHandler('passiveCanvasChanged', this.onCanvasChangedRemote.bind(this));
        this.api.getEventApi().addEventHandler('wordToGuessChanged', this.onWordToGuessChanged.bind(this));
        this.api.getEventApi().addEventHandler('newGuessChatMessage', this.onNewGuessChatMessage.bind(this));
        this.api.getEventApi().addEventHandler('activePlayerChanged', this.onActivePlayerChanged.bind(this));
        this.api.getEventApi().addEventHandler('wordSelectionOptions', this.onWordSelectionOptions.bind(this));
        this.api.getEventApi().addEventHandler('wordToDrawChanged', this.onWordToDrawChanged.bind(this));
        this.api.getEventApi().addEventHandler('drawingSolution', this.onDrawingSolution.bind(this));
        this.api.getEventApi().addEventHandler('gameStateChanged', this.onGameStateChanged.bind(this));
        this.api.getEventApi().addEventHandler('configurationChanged', this.onRemoteConfigChanged.bind(this));
    }

    componentWillUnmount() {
        this.api.getEventApi().removeEvent('passiveCanvasChanged');
        this.api.getEventApi().removeEvent('wordToGuessChanged');
        this.api.getEventApi().removeEvent('newGuessChatMessage');
        this.api.getEventApi().removeEvent('activePlayerChanged');
        this.api.getEventApi().removeEvent('wordSelectionOptions');
        this.api.getEventApi().removeEvent('wordToDrawChanged');
        this.api.getEventApi().removeEvent('drawingSolution');
        this.api.getEventApi().removeEvent('gameStateChanged');
        this.api.getEventApi().removeEvent('configurationChanged');
    }

    /* ====================== */
    /* Remote Event Listeners */
    /* ====================== */

    onRemoteConfigChanged(eventData: EventDataObject): void {
        let {configuration} = eventData;
        this.setState({
            defaultConfig: configuration
        });
    }

    onGameStateChanged(eventData: EventDataObject): void {
        let {gameState} = eventData; // either the string configuration or the string running

        this.setState({
            currentGameState: gameState
        });
    }

    onDrawingSolution(eventData: EventDataObject): void {
        let {solution, scoreboard} = eventData; // a string with the last word and the entire scoreboard to this point

        this.scoreboard = scoreboard as {[key: string]: number};

        this.addChatMessage(
            `Das Wort war: ${solution}`,
            null,
            null,
            'solution'
        );

        this.setState({
            lastWord: solution,
            currentWord: null,
            timerUntil: null,
            currentMask: null
        });
    }

    onWordToDrawChanged(eventData: EventDataObject): void {
        let {word} = eventData; // a string with the word, that should be drawn
        this.setState({
            currentWord: word
        });
    }

    onWordSelectionOptions(eventData: EventDataObject): void {
        let {options} = eventData; // an array of three strings
        this.setState({
            currentWordOptions: options
        });
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

        let player = this.api.getPlayerApi().getPlayerById(activePlayer);

        this.addChatMessage(
            `${player?.getUsername()} is an der Reihe!`,
            null,
            null,
            'choosing'
        );


        this.setState({
            activePlayerId: activePlayer,
            timerUntil: null,
            currentWord: null,
            currentMask: null,
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
        this.setState({
            currentMask: mask,
            timerUntil: timeUntil ?? this.state.timerUntil
        });
    }

    onCanvasChangedRemote(event: EventDataObject): void {
        if(event && this.state.activePlayerId !== ProfileManager.getId()) {
            this.drawingCommandQueue.push(event as canvasChangedEvent);
        }
    }


    /* ====================== */
    /* Locale Event Listeners */
    /* ====================== */

    onWordSelection(word: string): void {
        this.api.getEventApi().sendMessageToServer('activeWordChosen', {
            selection: word
        });
    }

    onGameConfigSubmitted(config: GameConfigObject): void {
        this.api.getEventApi().sendMessageToServer('submitConfigAndStart', {
            configuration: config
        });
        this.setState({
            defaultConfig: config
        });
    }

    onGameConfigChanged(config: GameConfigObject): void {
        this.api.getEventApi().sendMessageToServer('configChangedPreview', {
            configuration: config
        });
    }

    onMessageSend(message: string): void {
        this.api.getEventApi().sendMessageToServer('attemptGuess', {
            guess: message
        });
    }

    onGetQueuedDrawCommands(): canvasChangedEvent[] {
        let queue = this.drawingCommandQueue.shift();
        return queue ? [queue] : [];
    }

    onCanvasChanged(event: canvasChangedEvent): void {
        this.api.getEventApi().sendMessageToServer('activeCanvasChanged', {
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

    addChatMessage(message: string, sender: string|null, timestamp: number|null, coloring: string|null = null): void {
        this.messageHistory.push({
            text: message,
            sender: sender || 'system',
            timestamp: timestamp || Date.now(),
            coloring: coloring
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

    renderDrawingBoardSpace(allowDrawing: boolean, isUserRoomMaster: boolean, isActivePlayer: boolean): JSX.Element {
        let state = this.state.currentGameState;

        if(state === 'selecting' && !isActivePlayer) {
            state = 'waiting';
        }

        switch(state) {
            case 'configuration':
                return (
                    <GameConfig
                        onSubmit={this.onGameConfigSubmitted.bind(this)}
                        onChange={this.onGameConfigChanged.bind(this)}
                        allowChanges={isUserRoomMaster}
                        defaultConfig={isUserRoomMaster ? null : this.state.defaultConfig}
                    />
                );
            case 'selecting':
                return (
                    <WordSelection onSelect={this.onWordSelection.bind(this)}
                                   options={this.state.currentWordOptions}
                    />
                );
            default:
                return (
                    <DrawingCanvas
                        drawingMode={this.state.currentMode}
                        drawingColor={this.state.currentColor}
                        drawingWeight={this.state.currentWeight}
                        enableManualDrawing={allowDrawing}
                        gatherDrawCommandCallback={this.onGetQueuedDrawCommands.bind(this)}
                        onCanvasChanged={this.onCanvasChanged.bind(this)}
                    />
                );
        }
    }

    render(): ReactNode {
        let isActivePlayer = this.state.activePlayerId === ProfileManager.getId();
        let allowDrawing = isActivePlayer && this.state.currentGameState === 'drawing';
        let isUserRoomMaster = ProfileManager.getId() === RoomManager.getRoomMaster()?.getId();

        return (
            <div id={"drawAndGuess"} key={"drawAndGuess"}>
                <div className={"drawing-board"}>
                    {this.renderDrawingBoardSpace(allowDrawing, isUserRoomMaster, isActivePlayer)}

                    {(!allowDrawing || this.state.currentGameState === 'configuration') ? null :
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

                <div className={"guessing-chat"} style={{
                    opacity: this.state.currentGameState === 'configuration' ? 0.1 : 1
                }}>
                    <GameStateBox
                        countdownUntil={this.state.timerUntil}
                        wordMask={allowDrawing ? this.state.currentWord : this.state.currentMask}
                        isGuessing={!allowDrawing}
                    />
                    <ChatBox
                        onSendCallback={this.onMessageSend.bind(this)}
                        messageHistory={this.messageHistory}
                        isGuessing={!allowDrawing && this.state.currentGameState === 'drawing'}
                    />
                </div>
            </div>
        );
    }
}