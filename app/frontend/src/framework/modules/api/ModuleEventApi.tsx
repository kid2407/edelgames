import ModuleApi from "../ModuleApi";
import EventManager from "../../util/EventManager";
import SocketManager from "../../util/SocketManager";

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

export default class ModuleEventApi {

    private api: ModuleApi;
    private eventListeners: EventHandlerFunctionList = {};

    constructor(api: ModuleApi) {
        this.api = api;
        EventManager.subscribe('ServerToClientGameMessageEventNotified', this.onServerToClientMessageEventNotified.bind(this));
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
        let event = skipPrefix ? eventName : this.api.getGameId() + '_' + eventName;
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
        let event = this.api.getGameId() + '_' + eventName;
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(handler);
    }

    public removeEvent(eventName: string): void {
        let event = this.api.getGameId() + '_' + eventName;
        if (!this.eventListeners[event]) {
            return;
        }

        this.eventListeners[event] = [];
    }

    public sendMessageToServer(messageTypeId: string, eventData: ({ [key: string]: any })): void {
        SocketManager.sendEvent('clientToServerGameMessage', {
            messageTypeId: this.api.getGameId() + '_' + messageTypeId,
            ...eventData
        });
    }

}