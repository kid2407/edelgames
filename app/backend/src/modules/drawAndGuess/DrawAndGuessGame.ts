import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleRoomApi from "../../framework/modules/ModuleRoomApi";

/*
 * The actual game instance, that controls and manages the game
 */
export default class DrawAndGuessGame implements ModuleGameInterface {

    roomApi: ModuleRoomApi = null;

    onGameInitialize(roomApi: ModuleRoomApi): void {
        this.roomApi = roomApi;
        //this.roomApi.addEventHandler('userMessageSend', this.onUserMessageReceived.bind(this));
    }

    onUserMessageReceived(eventData: { [key: string]: any }) {
        /*
        this.roomApi.sendRoomMessage('serverMessageSend', {
            user: eventData.senderId,
            message: eventData.message
        });
         */
    }

}