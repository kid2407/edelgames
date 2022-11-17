import Controller from "../controller";

type subscriber = (data: object) => void;

interface subscriberObject {
    [key: string]: subscriber[]
}

export default class SocketMessenger {

    protected static subscribers: subscriberObject = {};

    // send a message to all sockets via the given channel
    static broadcast(channel: string, message: object) {
        Controller.io.emit(channel, message)
    }

    // send a message to a specific socket via the given channel
    static directMessage(userId: string, channel: string, message: object): void {

    }

    // will be called, when a socket sends a message to the server. Distributes the message to all subscribers
    static receiveMessage(channel: string, message: object) {
        if(!SocketMessenger.subscribers[channel]) {
            return; // no subscribers registered for this channel. Just ignore the message
        }

        // call every subscriber in the list and pass the message as an argument
        let subscriberList = SocketMessenger.subscribers[channel];
        for(let listener in subscriberList) {
            if(subscriberList.hasOwnProperty(listener)) {
                subscriberList[listener](message);
            }
        }
    }

    // register a subscriber to a channel, that will be called upon receiving such a message
    static subscribeChannel(channel: string, listener: subscriber): void {
        if(SocketMessenger.subscribers[channel] === undefined) {
            SocketMessenger.subscribers[channel] = [];
            Controller.io.on(channel, SocketMessenger.receiveMessage);
        }

        this.subscribers[channel].push(listener);
    }


}