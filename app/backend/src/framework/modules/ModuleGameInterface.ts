import ModuleApi from "./ModuleApi";


export default interface ModuleGameInterface {

    onGameInitialize(roomApi: ModuleApi): void;

}