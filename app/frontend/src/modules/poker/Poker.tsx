import ModuleInterface from "../../framework/modules/ModuleInterface";
import preview from "./preview.png";
import PokerGame from "./PokerGame";
import {ReactNode} from "react";

/*
 * A static singleton class, that contains technical details and a render method for showing the game
 */
class Poker implements ModuleInterface {

    getPreviewImage(): string | undefined {
        return preview;
    }

    getTitle(): string {
        return "Poker (Texas Hold'em)";
    }

    getUniqueId(): string {
        return "poker";
    }

    renderGame(): ReactNode {
        return (<PokerGame/>);
    }

}

const poker = new Poker();
export default poker;