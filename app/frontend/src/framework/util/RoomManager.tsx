/**
 * Stores and manages all data of the current room
 */
import User from "./User";
import eventManager, {EventDataObject} from "./EventManager";

export const RoomEventNames = {
    roomChangedEventNotified: "roomChangedEventNotified",
    lobbyRoomsChangedEventNotified: "lobbyRoomsChangedEventNotified",
    roomUpdated: "roomUpdated",
    returnToLobby: "returnToLobby",
    createNewRoom: "createNewRoom",
    joinRoom: "joinRoom",
    returnToGameSelection: "returnToGameSelection",
    changeRoomName: "changeRoomName",
    changeRoomPass: "changeRoomPass",
}

export type ServerRoomMember = {
    id: string;
    username: string;
    picture: string | null;
    isRoomMaster: boolean;
}

type ServerRoomObject = {
    roomId: string;
    roomName: string;
    requiredPassphrase: boolean;
    roomMembers: ServerRoomMember[];
    currentGameId: string;
}


class RoomManager {

    private roomId: string = 'lobby';
    private roomName: string = 'Lobby';
    private roomPassword: string|undefined = undefined;
    private roomMembers: User[] = [];
    private roomMaster: User | null = null;
    private currentGameId: string = '';

    constructor() {
        eventManager.subscribe(RoomEventNames.roomChangedEventNotified, this.onRoomChangedChannelNotified.bind(this))
    }

    onRoomChangedChannelNotified(data: EventDataObject): void {
        data = data as ServerRoomObject;

        this.roomId = data.roomId;
        this.roomName = data.roomName;
        this.currentGameId = data.currentGameId;
        if(!data.requirePassphrase) this.roomPassword = undefined;

        // calculate new room members
        let roomMembers: User[] = [];
        for (let member of data.roomMembers) {
            let user = new User(
                member.id,
                member.username,
                member.picture,
                member.isRoomMaster
            );

            if (member.isRoomMaster) {
                this.roomMaster = user;
            }

            roomMembers.push(user);
        }
        this.roomMembers = roomMembers;

        eventManager.publish(RoomEventNames.roomUpdated);
    }

    public getRoomId(): string {
        return this.roomId;
    }

    public getRoomName(): string {
        return this.roomName;
    }

    public setRoomName(name: string): void {
        this.roomName = name;
    }

    public getRoomPassword(): string|undefined {
        return this.roomPassword;
    }

    public setRoomPassword(password: string|undefined): void {
        this.roomPassword = password;
    }

    public getRoomMembers(): User[] {
        return this.roomMembers;
    }

    public getRoomMaster(): User | null {
        return this.roomMaster;
    }

    public getCurrentGameId(): string {
        return this.currentGameId;
    }
}

const roomManager = new RoomManager();
export default roomManager;
export type RoomManagerType = typeof roomManager;