import ModuleInterface from "../../framework/modules/ModuleInterface";
import preview from "./preview.png";
import {ReactNode} from "react";
import DrawAndGuessGame from "./DrawAndGuessGame";

/*
 * A static singleton class, that contains technical details and a render method for showing the game
 */
class DrawAndGuess implements ModuleInterface {

    getPreviewImage(): string | undefined {
        return preview;
    }

    getTitle(): string {
        return "Montagsmaler";
    }

    getUniqueId(): string {
        return "drawAndGuess";
    }

    renderGame(): ReactNode {
        return (<DrawAndGuessGame />);
    }

}

const drawAndGuess = new DrawAndGuess();
export default drawAndGuess;