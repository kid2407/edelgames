import ModuleInterface from "./ModuleInterface";
import {ModuleList} from "../../modules/ModuleList";


class ModuleRegistry {

    public getModuleList(): ModuleInterface[] {
        return ModuleList;
    }

    public getModuleById(id: string): ModuleInterface | undefined {
        return this.getModuleList().find(module => module.getUniqueId() === id);
    }

}


const moduleRegistry = new ModuleRegistry();
export default moduleRegistry;