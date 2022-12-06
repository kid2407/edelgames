import ModuleInterface from "../../framework/modules/ModuleInterface";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import StadtLandFlussGame from "./StadtLandFlussGame";

class StadtLandFluss implements ModuleInterface {
    getGameInstance(): ModuleGameInterface {
        return new StadtLandFlussGame();
    }

    getUniqueId(): string {
        return "stadtLandFluss";
    }

}

const stadtLandFluss = new StadtLandFluss()

export default stadtLandFluss