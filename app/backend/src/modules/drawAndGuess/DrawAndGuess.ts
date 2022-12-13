import ModuleInterface from "../../framework/modules/ModuleInterface";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import DrawAndGuessGame from "./DrawAndGuessGame";

/*
 * This singleton is used to register the game to the ModuleList
 */
class DrawAndGuess implements ModuleInterface {

    getUniqueId(): string {
        return "drawAndGuess";
    }

    getGameInstance(): ModuleGameInterface {
        return new DrawAndGuessGame();
    }


}

const drawAndGuess = new DrawAndGuess();
export default drawAndGuess;