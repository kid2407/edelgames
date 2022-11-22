import Room from "./Room";
import User from "./User";

export class RoomManagerSingleton {

    private readonly lobby: Room;
    private rooms: Room[] = [];

    constructor() {
        // create lobby room
        this.lobby = new Room(null, true);
    }

    // rooms require a user as the admin
    public createRoom(firstUser: User): void {
        let newRoom = new Room(firstUser);
        firstUser.switchRoom(newRoom).then(newRoom.sendRoomChangedBroadcast);
        this.rooms.push(newRoom);
    }

    // rooms will be automatically removed, when the last user leaves
    public removeRoom(room: Room): void {
        if(room.getMemberCount() === 0) {
            this.rooms = this.rooms.filter(r => r !== room);
        }
    }

    public getRoomById(roomId: string): Room|null  {
        return this.rooms.find(room => room.getRoomId() === roomId) || null;
    }

    public getLobbyRoom(): Room {
        return this.lobby;
    }

    public getRoomList(): Room[] {
        return this.rooms;
    }

}

const RoomManager = new RoomManagerSingleton();
export default RoomManager;