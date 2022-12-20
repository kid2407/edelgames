import ModuleInterface from "../../framework/modules/ModuleInterface";
import preview from "./preview.png";
import ExampleChatGame from "./ExampleChatGame";
import {ReactNode} from "react";

/*
 * A static singleton class, that contains technical details and a render method for showing the game
 */
class ExampleChat implements ModuleInterface {

    getPreviewImage(): string | undefined {
        return preview;
    }

    getTitle(): string {
        return "Beispiel Chat";
    }

    getUniqueId(): string {
        return "exampleChat";
    }

    renderGame(): ReactNode {
        return (<ExampleChatGame/>);
    }

}

const exampleChat = new ExampleChat();
export default exampleChat;