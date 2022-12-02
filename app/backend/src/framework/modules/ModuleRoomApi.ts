import Room from "../Room";
import SocketMessenger from "../util/SocketMessenger";
import ModuleGameInterface from "./ModuleGameInterface";
import debug from "../util/debug";

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
        this.room.setCurrentGame(this);
        game.onGameInitialize(this);
    }

    public getGameId(): string {
        return this.gameId;
    }

    /*
     * This method will be called automatically, every time an event is triggered.
     * It can also be used to manage internal events for the current game
     */
    public alertEvent(eventName: string, eventData: internalEventDataObject|null = null, skipPrefix: boolean = false) {
        let event = skipPrefix ? eventName : this.getGameId()+'_'+eventName;
        if(this.eventListeners[event]) {
            for(let listener of this.eventListeners[event]) {
                listener(eventData);
            }
        }
    }

    public addEventHandler(eventName: string, handler: internalEventHandlerFunction) {
        let event = this.getGameId()+'_'+eventName;
        if(!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(handler);

        debug(1,'registering eventlistener for ' + event);
    }

    // just an alias for addEventHandler('userJoined', handler) for better usability
    public addUserJoinedHandler(handler: internalEventHandlerFunction) {
        this.addEventHandler('userJoined', handler);
    }

    // just an alias for addEventHandler('userLeft', handler) for better usability
    public addUserLeaveHandler(handler: internalEventHandlerFunction) {
        this.addEventHandler('userLeft', handler);
    }

    // just an alias for addEventHandler('gameStopped', handler) for better usability
    public addGameStoppedHandler(handler: internalEventHandlerFunction) {
        this.addEventHandler('gameStopped', handler);
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