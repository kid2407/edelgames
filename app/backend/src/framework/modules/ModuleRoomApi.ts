import Room from "../Room";
import SocketMessenger from "../util/SocketMessenger";
import ModuleGameInterface from "./ModuleGameInterface";

type internalEventDataObject = {
    [key: string]: any
}
type internalUserMessageEventDataObject = {
    senderId: string,
    [key: string]: any
}
type internalEventHandlerFunction = (eventData: internalEventDataObject|null) => void;
type internalUserEventHandlerFunction = (eventData: internalUserMessageEventDataObject) => void;
type internalEventList = {
    [key: string]: internalEventHandlerFunction[]
}

/*
 * This class will be passed to the game instance to allow for restricted access to the room data.
 * That way, a game cannot influence a room more than it is supposed to
 */
export default class ModuleRoomApi {

    private readonly game: ModuleGameInterface;
    private readonly room: Room;
    private readonly gameId: string;
    private eventListeners: internalEventList = {};

    constructor(gameId: string, game: ModuleGameInterface, room: Room) {
        this.game = game;
        this.gameId = gameId;
        this.room = room;
    }

    public getGameId(): string {
        return this.gameId;
    }

    /*
     * This method will be called automatically, every time an event is triggered.
     * It can also be used to manage internal events for the current game
     */
    public alertEvent(eventName: string, eventData: internalEventDataObject|null = null) {
        if(this.eventListeners[eventName]) {
            for(let listener of this.eventListeners[eventName]) {
                listener(eventData);
            }
        }
    }

    public addEventHandler(eventName: string, handler: internalEventHandlerFunction) {
        if(!this.eventListeners[eventName]) {
            this.eventListeners[eventName] = [];
        }
        this.eventListeners[eventName].push(handler);
    }

    // just an alias for addEventHandler('userJoined', handler) for better usability
    public addUserJoinedHandler(handler: internalEventHandlerFunction) {
        this.addEventHandler('userJoined', handler);
    }

    // just an alias for addEventHandler('userLeft', handler) for better usability
    public addUserLeaveHandler(handler: internalEventHandlerFunction) {
        this.addEventHandler('userLeft', handler);
    }

    /*
     * Adds a handler for all messages, that the frontend game module can send to the server
     * For better usability, these messages can be assigned a messageTypeId. Essentially separating multiple messages from one another
     */
    public addUserMessageReceivedHandler(messageTypeId: string, handler: internalUserEventHandlerFunction) {
        this.addEventHandler('userMessage_'+messageTypeId+'_Received', handler);
    }

    public sendRoomMessage(eventName: string, eventData: ({[key: string]: any})): void {
        SocketMessenger.broadcast(this.room.getRoomId(), eventName, eventData);
    }

    public sendPlayerMessage(playerId: string, eventName: string, eventData: ({[key: string]: any})): void {
        let user = this.room.getRoomMembers().find(user => user.getId() === playerId);
        SocketMessenger.directMessageToSocket(user.getSocket(), eventName, eventData);
    }

    // this will cancel / stop / end the current game instance and return the members back to the game select (idle) room
    public cancelGame() {
        this.room.setCurrentGame(null);
    }

}