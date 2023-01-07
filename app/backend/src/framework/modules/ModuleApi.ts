import Room from "../Room";
import SocketManager from "../util/SocketManager";
import ModuleGameInterface from "./ModuleGameInterface";
import {Logger, systemLogger} from "../util/Logger";
import User from "../User";
import ModulePlayerApi from "./api/ModulePlayerApi";
import ModuleEventApi from "./api/ModuleEventApi";

/*
 * This class will be passed to the game instance to allow for restricted access to the room data.
 * That way, a game cannot influence a room more than it is supposed to
 */
export default class ModuleApi {

    private readonly game: ModuleGameInterface;
    private readonly gameId: string;
    private readonly playerApi: ModulePlayerApi;
    private readonly eventApi: ModuleEventApi;
    private readonly logger: Logger;

    constructor(gameId: string, game: ModuleGameInterface, room: Room) {
        this.game = game;
        this.gameId = gameId;

        this.logger = new Logger(this.gameId);
        this.eventApi = new ModuleEventApi(this);
        this.playerApi = new ModulePlayerApi(room, this);

        room.setCurrentGame(this);
    }

    public getGameId(): string {
        return this.gameId;
    }

    public getLogger(): Logger {
        return this.logger;
    }

    public getPlayerApi(): ModulePlayerApi {
        return this.playerApi;
    }

    public getEventApi(): ModuleEventApi {
        return this.eventApi;
    }

    // this will cancel / stop / end the current game instance and return the members back to the game select (idle) room
    public cancelGame(): void {
        this.playerApi.getRoom().setCurrentGame(null);
    }
}