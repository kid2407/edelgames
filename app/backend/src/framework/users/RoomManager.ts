import Room from "./Room";
import User from "./User";
import SocketMessenger from "../util/SocketMessenger";

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

    public updateLobbyMembersRoomData(): void {
        let roomData: {rooms: object[]} = {
            rooms:  [
                {
                    roomId:      this.lobby.getRoomId(),
                    roomName:    this.lobby.getRoomName(),
                    roomMembers: this.lobby.getPublicRoomMemberList(),
                }
            ]
        };

        for(let room of this.rooms) {
            roomData.rooms.push({
                roomId: room.getRoomId(),
                roomName: room.getRoomName(),
                roomMembers: room.getPublicRoomMemberList(),
            });
        }

        SocketMessenger.broadcast(this.getLobbyRoom().getRoomId(), 'lobbyRoomsChanged', roomData)
    }

}

const RoomManager = new RoomManagerSingleton();
export default RoomManager;