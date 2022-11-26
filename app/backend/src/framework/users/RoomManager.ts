import Room from "./Room";
import User from "./User";
import SocketMessenger from "../util/SocketMessenger";
import Lobby from "./Lobby";

export class RoomManagerSingleton {

    private readonly lobby: Lobby;
    private rooms: Room[] = [];
    private screen: string;

    constructor() {
        // create lobby room
        this.lobby = new Lobby();
    }

    // rooms require a user as the admin
    public createRoom(firstUser: User): void {
        let newRoom = new Room(firstUser);
        this.rooms.push(newRoom);
        firstUser.switchRoom(newRoom).then(newRoom.sendRoomChangedBroadcast.bind(newRoom));
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

    public getLobbyRoom(): Lobby {
        return this.lobby;
    }

    public getRoomList(): Room[] {
        return this.rooms;
    }

    public updateLobbyMembersRoomData(): void {
        SocketMessenger.broadcast(this.getLobbyRoom().getRoomId(), 'lobbyRoomsChanged', this.getLobbyMemberRoomData())
    }

    public getLobbyMemberRoomData(): {rooms: object[]} {
        let roomData: {rooms: object[]} = {
            rooms:  []
        };

        for(let room of [...this.rooms, this.lobby]) {
            roomData.rooms.push({
                roomId: room.getRoomId(),
                roomName: room.getRoomName(),
                roomMembers: room.getPublicRoomMemberList(),
            });
        }
        return roomData;
    }

}

const RoomManager = new RoomManagerSingleton();
export default RoomManager;