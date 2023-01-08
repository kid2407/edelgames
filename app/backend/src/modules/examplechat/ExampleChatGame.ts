import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleApi from "../../framework/modules/ModuleApi";

/*
 * The actual game instance, that controls and manages the game
 */
export default class ExampleChatGame implements ModuleGameInterface {

    api: ModuleApi = null;

    onGameInitialize(api: ModuleApi): void {
        this.api = api;
        this.api.getEventApi().addEventHandler('userMessageSend', this.onUserMessageReceived.bind(this));
    }

    onUserMessageReceived(eventData: { [key: string]: any }) {
        this.api.getLogger().debug(`User ID ${eventData.senderId} send in message: `, eventData.message);
        this.api.getPlayerApi().sendRoomMessage('serverMessageSend', {
            user: eventData.senderId,
            message: eventData.message
        });
    }

}