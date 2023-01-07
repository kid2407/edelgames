import {Logger} from "../util/Logger";

export default abstract class ModuleLogger {

    constructor(moduleId: string) {
        this.logger = new Logger(moduleId)
    }

    public readonly logger: Logger

}