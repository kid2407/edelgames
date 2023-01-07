import ModuleGameInterface from "./ModuleGameInterface";
import SocketManager from "../util/SocketManager";
import ModuleInterface from "./ModuleInterface";
import EventManager from "../util/EventManager";
import RoomManager from "../util/RoomManager";
import User from "../util/User";

export type EventDataObject = {
    [key: string]: any
}

export type EventHandlerFunction = (eventData: EventDataObject) => void;

// is used to store the event handlers for each event
type EventHandlerFunctionList = {
    [key: string]: EventHandlerFunction[]
}

// can be used to store multiple event handlers
export type EventHandlerFunctionStack = {
    [key: string]: EventHandlerFunction
}

/*
 * This class will be passed to the game instance to allow for restricted access to the room data.
 * That way, a game cannot influence a room more than it is supposed to
 */
export default class ModuleGameApi {

    private readonly game: ModuleInterface;
    private readonly gameInstance: ModuleGameInterface;
    private eventListeners: EventHandlerFunctionList = {};

    constructor(game: ModuleInterface, gameInstance: ModuleGameInterface) {
        this.game = game;
        this.gameInstance = gameInstance;
        EventManager.subscribe('ServerToClientGameMessageEventNotified', this.onServerToClientMessageEventNotified.bind(this))
    }

    /**
     * @internal
     */
    public onServerToClientMessageEventNotified(eventData: EventDataObject) {
        this.alertEvent(eventData.messageTypeId, eventData, true)
    }

    /*
     * This method will be called automatically, every time an event is triggered.
     * It can also be used to manage internal events for the current game
     */
    public alertEvent(eventName: string, eventData: EventDataObject = {}, skipPrefix: boolean = false): number {
        let event = skipPrefix ? eventName : this.game.getUniqueId() + '_' + eventName;
        if (!this.eventListeners[event]) {
            return 0;
        }

        let alertedListenerCount = 0;
        if (this.eventListeners[event]) {
            for (let listener of this.eventListeners[event]) {
                listener(eventData);
                alertedListenerCount++;
            }
        }
        return alertedListenerCount;
    }

    public addEventHandler(eventName: string, handler: EventHandlerFunction): void {
        let event = this.game.getUniqueId() + '_' + eventName;
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(handler);
    }

    public removeEventHandler(eventName: string, handler: EventHandlerFunction): void {
        let event = this.game.getUniqueId() + '_' + eventName;
        if (!this.eventListeners[event]) {
            return;
        }

        this.eventListeners[event] = this.eventListeners[event].filter(el => el !== handler);
    }

    public removeEvent(eventName: string): void {
        let event = this.game.getUniqueId() + '_' + eventName;
        if (!this.eventListeners[event]) {
            return;
        }

        this.eventListeners[event] = [];
    }

    public sendMessageToServer(messageTypeId: string, eventData: ({ [key: string]: any })): void {
        SocketManager.sendEvent('clientToServerGameMessage', {
            messageTypeId: this.game.getUniqueId() + '_' + messageTypeId,
            ...eventData
        });
    }

    public getUserDataById(playerId: string): User | undefined {
        return RoomManager.getRoomMembers().find(member => member.getId() === playerId);
    }
}