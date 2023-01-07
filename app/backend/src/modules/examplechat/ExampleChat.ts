import ModuleInterface from "../../framework/modules/ModuleInterface";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ExampleChatGame from "./ExampleChatGame";

/*
 * This singleton is used to register the game to the ModuleList
 */
class ExampleChat implements ModuleInterface {

    getUniqueId(): string {
        return "exampleChat";
    }

    getGameInstance(): ModuleGameInterface {
        return new ExampleChatGame(this.getUniqueId());
    }


}

const exampleChat = new ExampleChat();
export default exampleChat;