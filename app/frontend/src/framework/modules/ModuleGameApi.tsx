import ModuleGameInterface from "./ModuleGameInterface";
import SocketManager from "../util/SocketManager";
import ModuleInterface from "./ModuleInterface";
import EventManager from "../util/EventManager";
import RoomManager from "../util/RoomManager";
import {Simulate} from "react-dom/test-utils";
import play = Simulate.play;
import User from "../util/User";

type internalEventDataObject = {
        [key: string]: any
}
type internalUserMessageEventDataObject = {
    senderId: string,
    [key: string]: any
}
type internalEventHandlerFunction = (eventData: internalEventDataObject) => void;
type internalUserEventHandlerFunction = (eventData: internalUserMessageEventDataObject) => void;
type internalEventList = {
    [key: string]: internalEventHandlerFunction[]
}

/*
 * This class will be passed to the game instance to allow for restricted access to the room data.
 * That way, a game cannot influence a room more than it is supposed to
 */
export default class ModuleGameApi {

    private readonly game: ModuleInterface;
    private readonly gameInstance: ModuleGameInterface;
    private eventListeners: internalEventList = {};

    constructor(game: ModuleInterface, gameInstance: ModuleGameInterface) {
        this.game = game;
        this.gameInstance = gameInstance;
        EventManager.subscribe('ServerToClientGameMessageEventNotified', this.onServerToClientMessageEventNotified.bind(this))
    }

    /**
     * @internal
     */
    public onServerToClientMessageEventNotified(eventData: internalEventDataObject) {
        this.alertEvent(eventData.messageTypeId, eventData, true)
    }

    /*
     * This method will be called automatically, every time an event is triggered.
     * It can also be used to manage internal events for the current game
     */
    public alertEvent(eventName: string, eventData: internalEventDataObject = {}, skipPrefix: boolean = false) {
        let event = skipPrefix ? eventName : this.game.getUniqueId()+'_'+eventName;
        if(this.eventListeners[event]) {
            for(let listener of this.eventListeners[event]) {
                listener(eventData);
            }
        }
    }

    public addEventHandler(eventName: string, handler: internalEventHandlerFunction) {
        let event = this.game.getUniqueId()+'_'+eventName;
        if(!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(handler);
    }

    public sendMessageToServer(messageTypeId: string, eventData: ({[key: string]: any})): void {
        SocketManager.sendEvent('clientToServerGameMessage', {
            messageTypeId: this.game.getUniqueId()+'_'+messageTypeId,
            ...eventData
        });
    }


    public getPlayerDataById(playerId: string): User|undefined {
        return RoomManager.getRoomMembers().find(member => member.getId() === playerId);
    }
}