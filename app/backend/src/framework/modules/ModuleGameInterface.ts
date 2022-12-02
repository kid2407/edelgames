import ModuleRoomApi from "./ModuleRoomApi";


export default interface ModuleGameInterface {

    onGameInitialize(roomApi: ModuleRoomApi): void;
    onGameEnd(): void;

}