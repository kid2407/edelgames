import Controller from "../Controller";

type ListenerFunction = (data: object) => void;


// https://socket.io/docs/v3/emit-cheatsheet/
export default class SocketMessenger {

    // send a message to all sockets! use wisely
    public static globalBroadcast(eventName: string, message: object) {
        Controller.io.emit(eventName, message)
    }

    // send a message to all sockets via the given eventName in a room
    public static broadcast(room: string, eventName: string, message: object) {
        Controller.io.in(room).emit(eventName, message)
    }

    // send a message to a specific socket via the given channel
    public static directMessage(socketId: string, eventName: string, message: object): void {
        Controller.io.to(socketId).emit(eventName, message);
    }

    // register a subscriber to a channel, that will be called upon receiving such a message
    public static subscribeEvent(eventName: string, listener: ListenerFunction): void {
        Controller.io.on(eventName, listener);
    }

    /*
    // will be called without context
    public static eventListenerProxy(listener: ListenerFunction, data: object): void {
        listener(data);
    }
     */


}