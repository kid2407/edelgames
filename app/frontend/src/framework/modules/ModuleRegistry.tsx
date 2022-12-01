import ModuleInterface from "./ModuleInterface";
import {ModuleList} from "../../modules/ModuleList";


class ModuleRegistry {

    public getModuleList(): ModuleInterface[] {
        return ModuleList;
    }

    public getModuleById(id: string): ModuleInterface|null {
        return this.getModuleList().find(module => module.getUniqueId() === id) || null;
    }

}


const moduleRegistry = new ModuleRegistry();
export default moduleRegistry;