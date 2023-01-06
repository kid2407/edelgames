import ModuleInterface from "./ModuleInterface";
import ModuleList from "../../modules/ModuleList";
import Room from "../Room";
import ModuleRoomApi from "./ModuleRoomApi";
import {systemLogger} from "../util/Logger";


class ModuleRegistry {

    public getModuleList(): ModuleInterface[] {
        return ModuleList;
    }

    public getModuleById(id: string): ModuleInterface | null {
        return this.getModuleList().find(module => module.getUniqueId() === id) || null;
    }

    public createGame(room: Room, gameId: string) {
        let module = this.getModuleById(gameId);

        if (!module) {
            systemLogger.warning( `Failed to start game with id ${gameId} for room ${room.getRoomId()}`);
            return;
        }

        let gameInstance = module.getGameInstance();
        // create the module API -> it will be automatically passed to the game instance
        new ModuleRoomApi(gameId, gameInstance, room);
    }

}


const moduleRegistry = new ModuleRegistry();
export default moduleRegistry;