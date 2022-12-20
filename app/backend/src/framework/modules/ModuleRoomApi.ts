import Room from "../Room";
import SocketManager from "../util/SocketManager";
import ModuleGameInterface from "./ModuleGameInterface";
import {systemLogger} from "../util/Logger";

type internalEventDataObject = {
    [key: string]: any
}
type internalEventHandlerFunction = (eventData: internalEventDataObject | null) => void;
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
    public alertEvent(eventName: string, eventData: internalEventDataObject = null, skipPrefix: boolean = false): void {
        let event = skipPrefix ? eventName : this.getGameId() + '_' + eventName;
        if (this.eventListeners[event]) {
            for (let listener of this.eventListeners[event]) {
                listener(eventData);
            }
        }
    }

    public addEventHandler(eventName: string, handler: internalEventHandlerFunction): void {
        let event = this.getGameId() + '_' + eventName;
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(handler);

        systemLogger.info('registering event listener for ' + event);
    }

    // just an alias for addEventHandler('userJoined', handler) for better usability
    public addUserJoinedHandler(handler: internalEventHandlerFunction): void {
        this.addEventHandler('userJoined', handler);
    }

    // just an alias for addEventHandler('userLeft', handler) for better usability
    public addUserLeaveHandler(handler: internalEventHandlerFunction): void {
        this.addEventHandler('userLeft', handler);
    }

    // just an alias for addEventHandler('gameStopped', handler) for better usability
    public addGameStoppedHandler(handler: internalEventHandlerFunction): void {
        this.addEventHandler('gameStopped', handler);
    }

    public sendRoomMessage(eventName: string, eventData: ({ [key: string]: any })): void {
        let event = this.getGameId() + '_' + eventName;
        SocketManager.broadcast(this.room.getRoomId(), 'ServerToClientGameMessage', {
            messageTypeId: event,
            ...eventData
        });
    }

    public sendPlayerMessage(playerId: string, eventName: string, eventData: ({ [key: string]: any })): void {
        let event = this.getGameId() + '_' + eventName;
        let user = this.room.getRoomMembers().find(user => user.getId() === playerId);
        SocketManager.directMessageToSocket(user.getSocket(), 'ServerToClientGameMessage', {
            messageTypeId: event,
            ...eventData
        });
    }

    // this will cancel / stop / end the current game instance and return the members back to the game select (idle) room
    public cancelGame(): void {
        this.room.setCurrentGame(null);
    }

}