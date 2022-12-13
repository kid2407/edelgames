import Room from "./Room";
import User from "./User";

export default class Lobby extends Room {

    constructor() {
        super(null);
        this.roomId = 'lobby';
        this.roomName = 'Lobby';
    }

    public getRoomMaster(): User | null {
        // the lobby does not have a room master
        return null;
    }

    public getCurrentScreen(): string {
        // there is only one possible screen for this room
        return 'lobby'
    }

}