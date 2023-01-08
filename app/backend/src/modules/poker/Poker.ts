import ModuleInterface from "../../framework/modules/ModuleInterface";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import PokerGame from "./PokerGame";

/*
 * This singleton is used to register the game to the ModuleList
 */
class Poker implements ModuleInterface {

    getUniqueId(): string {
        return "poker";
    }

    getGameInstance(): ModuleGameInterface {
        return new PokerGame();
    }

}

const poker = new Poker();
export default poker;