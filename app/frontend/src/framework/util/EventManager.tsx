import SocketManagerSingleton from "./SocketManager";

export type EventNameListObj = {
    [key: string]: string
}

interface ListenerFunction {
    [key: string]: Function[]
}

class EventManager {

    eventListeners: ListenerFunction = {};

    subscribe(event: string, listener: Function) {
        if(!this.eventListeners[event]) {
            this.eventListeners[event] = [];

            // if socket event -> create socket listener
            if(event.slice(-13) === 'EventNotified') {
                // e.g. "profileChangedEventNotified"
                SocketManagerSingleton.subscribeEvent(event.slice(0, -13), this.publish.bind(this, event));
            }
        }
        this.eventListeners[event].push(listener);
    }

    publish(event: string, eventData: object = {}) {
        if(this.eventListeners[event]) {
            for(let listener of this.eventListeners[event]) {
                listener(eventData);
            }
        }
    }

}

export default class EventManagerSingleton {

    private static instance: EventManager|null;

    private static getInstance(): EventManager  {
        if(!EventManagerSingleton.instance) {
            EventManagerSingleton.instance = new EventManager();
        }
        return EventManagerSingleton.instance;
    }

    public static subscribe(event: string, listener: Function) {
        EventManagerSingleton.getInstance().subscribe(event, listener);
    }

    public static publish(event: string, eventData: object = {}) {
        EventManagerSingleton.getInstance().publish(event, eventData);
    }

}