import ModuleApi from "../ModuleApi";
import User from "../../util/User";
import RoomManager from "../../util/RoomManager";
import ProfileManager, {ProfileManagerType} from "../../util/ProfileManager";

export default class ModulePlayerApi {

    private api: ModuleApi;

    constructor(api: ModuleApi) {
        this.api = api;
    }

    public getPlayers(): User[] {
        return RoomManager.getRoomMembers();
    }

    public getPlayerById(playerId: string): User | undefined {
        return this.getPlayers().find(member => member.getId() === playerId);
    }

    public getRoomMaster(): User | undefined {
        return RoomManager.getRoomMaster() || undefined;
    }

    public getLocalePlayer(): ProfileManagerType {
        return ProfileManager;
    }
}