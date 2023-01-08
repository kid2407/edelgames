import ModuleGameInterface from "./ModuleGameInterface";
import ModuleInterface from "./ModuleInterface";
import ModulePlayerApi from "./api/ModulePlayerApi";
import ModuleEventApi from "./api/ModuleEventApi";
import {Logger} from "../util/Logger";


/*
 * This class will be passed to the game instance to allow for restricted access to data.
 * That way, a game cannot influence a room more than it is supposed to
 */
export default class ModuleApi {

    private readonly game: ModuleInterface;
    private readonly gameInstance: ModuleGameInterface;
    private readonly eventApi: ModuleEventApi;
    private readonly playerApi: ModulePlayerApi;
    private readonly logger: Logger;

    constructor(game: ModuleInterface, gameInstance: ModuleGameInterface) {
        this.game = game;
        this.gameInstance = gameInstance;
        this.logger = new Logger(this.game.getUniqueId());
        this.eventApi = new ModuleEventApi(this);
        this.playerApi = new ModulePlayerApi(this);
    }

    public getGameId(): string {
        return this.game.getUniqueId();
    }

    public getPlayerApi(): ModulePlayerApi {
        return this.playerApi;
    }


    public getEventApi(): ModuleEventApi {
        return this.eventApi;
    }


    public getLogger(): Logger {
        return this.logger;
    }

}