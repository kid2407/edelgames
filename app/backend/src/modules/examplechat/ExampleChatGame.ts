import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleRoomApi from "../../framework/modules/ModuleRoomApi";
import ModuleLogger from "../../framework/modules/ModuleLogger";

/*
 * The actual game instance, that controls and manages the game
 */
export default class ExampleChatGame extends ModuleLogger implements ModuleGameInterface {

    roomApi: ModuleRoomApi = null;

    onGameInitialize(roomApi: ModuleRoomApi): void {
        this.roomApi = roomApi;
        this.roomApi.addEventHandler('userMessageSend', this.onUserMessageReceived.bind(this));
    }

    onUserMessageReceived(eventData: { [key: string]: any }) {
        this.logger.debug(`User ID ${eventData.senderId} send in message: `, eventData.message);
        this.roomApi.sendRoomMessage('serverMessageSend', {
            user: eventData.senderId,
            message: eventData.message
        });
    }

}