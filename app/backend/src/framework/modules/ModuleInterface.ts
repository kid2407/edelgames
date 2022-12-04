import ModuleGameInterface from "./ModuleGameInterface";

export default interface ModuleInterface {

    getUniqueId(): string;
    getGameInstance(): ModuleGameInterface;

}