import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleRoomApi from "../../framework/modules/ModuleRoomApi";
import debug from "../../framework/util/debug";

/*
 * The actual game instance, that controls and manages the game
 */
export default class ExampleChatGame implements ModuleGameInterface {

    roomApi: ModuleRoomApi = null;

    onGameInitialize(roomApi: ModuleRoomApi): void {
        this.roomApi = roomApi;
        this.roomApi.addEventHandler('userMessageSend', this.onUserMessageReceived.bind(this));
    }

    onUserMessageReceived(eventData: { [key: string]: any }) {
        debug(0, `User ID ${eventData.senderId} send in message: `, eventData.message);
        this.roomApi.sendRoomMessage('serverMessageSend', {
            user: eventData.senderId,
            message: eventData.message
        });
    }

}