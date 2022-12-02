import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleRoomApi from "../../framework/modules/ModuleRoomApi";

/*
 * The actual game instance, that controls and manages the game
 */
export default class ExampleChatGame implements ModuleGameInterface {

    roomApi: ModuleRoomApi|null = null;

    onGameInitialize(roomApi: ModuleRoomApi): void {
        this.roomApi = roomApi;
        this.roomApi.addEventHandler('userMessageSend', this.onUserMessageReceived.bind(this));
    }

    onUserMessageReceived(eventData: any) {
        console.log(eventData);
    }

}