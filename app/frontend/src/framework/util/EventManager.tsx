import SocketManagerSingleton from "./SocketManager";
import debug from "./debug";

export type EventNameListObj = {
    [key: string]: string
}

interface ListenerFunction {
    [key: string]: Function[]
}

export class EventManagerSingleton {

    private eventListeners: ListenerFunction = {};

    public subscribe(event: string, listener: Function) {
        if(!this.eventListeners[event]) {
            this.eventListeners[event] = [];

            // if socket event -> create socket listener
            if(event.slice(-13) === 'EventNotified') {
                debug('registered socket event: ' + event.slice(0, -13));
                // e.g. "profileChangedEventNotified"
                SocketManagerSingleton.subscribeEvent(event.slice(0, -13), this.publish.bind(this, event));
            }
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