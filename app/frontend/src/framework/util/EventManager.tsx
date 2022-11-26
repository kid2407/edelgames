import SocketManagerSingleton from "./SocketManager";
import debug from "./debug";

export type EventNameListObj = {
    [key: string]: string
}

interface ListenerFunction {
    [key: string]: Function[]
}

interface MessageEventObject {
    eventName: string,
    eventData: object
}

export class EventManagerSingleton {

    private eventListeners: ListenerFunction = {};

    constructor() {
        SocketManagerSingleton.subscribeEvent('message', this.onSocketMessage.bind(this))
    }

    public onSocketMessage(messageData: object): void {
        let {eventName, eventData} = messageData as MessageEventObject;
        this.publish(eventName + 'EventNotified', eventData);
    }

    public subscribe(event: string, listener: Function) {
        if(!this.eventListeners[event]) {
            this.eventListeners[event] = [];

            debug('registered event subscription: ' + event);
        }

        this.eventListeners[event].push(listener);
    }

    public publish(event: string, eventData: object = {}) {
        debug('publishing event: ' + event, eventData);
        if(this.eventListeners[event]) {
            for(let listener of this.eventListeners[event]) {
                listener(eventData);
            }
        }
    }

}

const EventManager = new EventManagerSingleton();
export default EventManager;