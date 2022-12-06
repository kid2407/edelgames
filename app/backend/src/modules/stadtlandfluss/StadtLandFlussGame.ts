import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleRoomApi from "../../framework/modules/ModuleRoomApi";

export default class StadtLandFlussGame implements ModuleGameInterface {
    roomApi: ModuleRoomApi | null = null;

    onGameInitialize(roomApi: ModuleRoomApi): void {
        this.roomApi = roomApi;
        this.roomApi.addEventHandler("returnToLobby", () => this.roomApi.cancelGame())
    }

}
