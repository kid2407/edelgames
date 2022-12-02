import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleRoomApi from "../../framework/modules/ModuleRoomApi";

/*
 * The actual game instance, that controls and manages the game
 */
export default class ExampleChatGame implements ModuleGameInterface {

    onGameInitialize(roomApi: ModuleRoomApi): void {

    }

    onGameEnd(): void {
        // here you can clean up some data or do other stuff, after the game ended
    }

}