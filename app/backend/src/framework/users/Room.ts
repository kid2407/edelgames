import User from "./User";
import SocketMessenger from "../util/SocketMessenger";
import RoomManager from "./RoomManager";

export default class Room {

    public static lobbyWasDefined : boolean = false;

    private readonly roomId: string;
    private readonly isLobby: boolean;
    private roomName: string;
    private roomMembers: User[] = [];
    private roomMaster: User|null;
    private roomPassword: string|null = null;

    constructor(roomMaster: User|null, isLobby: boolean = false) {
        if(isLobby && !Room.lobbyWasDefined) {
            Room.lobbyWasDefined = true;
            this.roomId = 'lobby';
            this.roomName = 'Lobby';
            this.roomMaster = null; // the lobby does not have a room master
            this.isLobby = true;
        }
        else {
            this.roomId = this.createIdHash();
            this.roomName = 'room'+this.roomId;
            this.roomMaster = roomMaster;
            this.isLobby = false;
        }
    }

    public getRoomId():     string  {return this.roomId;}
    public getRoomName():   string  {return this.roomName;}
    public getRoomMembers(): User[] {return this.roomMembers}
    public getRoomPassword(): string|null {return this.roomPassword}
    public getRoomMaster(): User|null {
        // if we don´t have a room master and are not in the lobby, we select another user as the room master
        if(this.roomMaster === null && !this.isLobby && this.roomMembers.length > 0) {
            this.roomMaster = this.roomMembers[0];
        }
        return this.roomMaster;
    }

    public setRoomName(newName: string): void  {
        this.roomName = newName;
        this.sendRoomChangedBroadcast();
    }

    public sendRoomChangedBroadcast(): void {
        this.broadcastRoomMembers('roomChanged', {
            roomId: this.roomId,
            roomName: this.roomName,
            roomMembers: this.getPublicRoomMemberList()
        });

        RoomManager.updateLobbyMembersRoomData();
    }

    public broadcastRoomMembers(eventName: string, data: object): void {
        SocketMessenger.broadcast(this.roomId, eventName, data);
    }

    private createIdHash(): string {
        return Math.random().toString().slice(2);
    }

    public getMemberCount(): number {
        return this.roomMembers.length;
    }

    public joinRoom(newMember: User, passphrase: string|null = null): boolean {
        if(passphrase !== this.roomPassword) {
            return false;
        }

        this.roomMembers.push(newMember);
        newMember.switchRoom(this).then(this.sendRoomChangedBroadcast.bind(this));
        return true;
    }

    /**
     * @internal
     * this should only be called, when the user object also changes! never on its own!
     * otherwise there could be a user in a room, that is not registered in said room
     */
    public removeUserFromRoom(user: User) {
        this.roomMembers = this.roomMembers.filter((member) => member !== user);
        this.sendRoomChangedBroadcast();
        if(this.getMemberCount() === 0) {
            RoomManager.removeRoom(this);
        }
    }

    getPublicRoomMemberList(): object[] {
        return this.roomMembers.map((member: User) => {
            return {
                username:   member.getUsername(),
                id:         member.getId(),
                picture:    member.getPictureUrl(),
                isRoomMaster: member === this.roomMaster
            };
        });
    }

}