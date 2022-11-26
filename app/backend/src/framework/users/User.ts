import {Socket} from "socket.io";
import cookie from 'cookie';
import Room from "./Room";
import SocketMessenger from "../util/SocketMessenger";
import RoomManager from "./RoomManager";

export default class User {

    private readonly id: string = ""; // required for identifying users with the same name
    private name: string = ""; // basically the username or guest_{id}
    private verified: boolean = false; // true, if the user did authenticate itself by login
    private currentRoom: Room|null = null;
    private pictureUrl: string|null = null;
    private authSessionId: string|null = null;
    private readonly socket: Socket;

    constructor(socket: Socket) {
        this.socket = socket;
        this.id = this.createIdHash();
        this.name = 'guest_'+this.id;
        this.sendUserProfileChangedMessage();
        this.checkSocketCookies();

        // register generic listeners
        SocketMessenger.subscribeEventToSocket(socket, 'userLoginAttempt', this.authenticate.bind(this));
        SocketMessenger.subscribeEventToSocket(socket, 'refreshLobbyRoomData', this.refreshLobbyRoomData.bind(this));
        SocketMessenger.subscribeEventToSocket(socket, 'createNewRoom', this.createNewRoom.bind(this));
        SocketMessenger.subscribeEventToSocket(socket, 'returnToLobby', this.returnToLobby.bind(this));
    }

    checkSocketCookies() {
        console.log(this.socket.handshake.headers.cookie);
        let cookies = cookie.parse(this.socket.handshake.headers.cookie||'');
        if(cookies.authSession) {
            this.authenticate({
                isAuthSessionId: true,
                password: cookies.authSession,
                username: ''
            })
        }
    }

    /** This will remove the user from its current room, hopefully leaving no reference behind. Thus allowing it to be cleared by the garbage collection
     *  Usually, this happens, when the user disconnects
     */
    destroyUser() {
        if(this.currentRoom) {
            this.currentRoom.removeUserFromRoom(this);
            this.currentRoom = null;
        }
    }

    public getUsername():       string      {return this.name;}
    public getId():             string      {return this.id;}
    public getPictureUrl():     string|null {return this.pictureUrl;}
    public getCurrentRoom():    Room|null   {return this.currentRoom;}
    public getSocket():         Socket      {return this.socket;}
    public isVerified():        boolean     {return this.verified;}

    private createIdHash(): string {
        return Math.random().toString(36).slice(2);
    }

    /**
     * Switches the user to the given room. SocketIo allows for multiple rooms at once, but we only want one at a time, so we leave the last one
     */
    public async switchRoom(newRoom: Room): Promise<any> {
        await this.socket.join(newRoom.getRoomId());

        if(this.currentRoom) {
            this.socket.leave(this.currentRoom.getRoomId());
            this.currentRoom.removeUserFromRoom(this);
        }

        this.currentRoom = newRoom;
    }

    public messageUser(eventName: string, data: object) {
        SocketMessenger.directMessageToSocket(this.socket, eventName, data);
    }

    private sendUserProfileChangedMessage() {
        this.messageUser('profileChanged', {
            id: this.id,
            username: this.name,
            pictureUrl: this.pictureUrl,
            verified: this.verified,
            authSessionId: this.authSessionId
        })
    }

    public authenticate(loginData: {isAuthSessionId: boolean, username: string, password: string}): boolean {
        let {username, password} = loginData;

        if(this.verified) {
            // already verified
            return true;
        }

        // todo try login with the xenforo api
        // case 1: isAuthSessionId => false -> login with credentials
        // case 2: isAuthSessionId => true  -> login with authSessionId in "password" and retrieve username from result
        let credentialsValid = true; // for now, let all attempts succeed
        if(credentialsValid) {
            this.verified = true;
            this.name = username || '[the username]'; // todo retrieve from api authentication
            this.pictureUrl = 'https://edelmaenner.net/data/avatars/m/0/324.jpg?1587625532'; // todo retrieve picture url
            this.authSessionId = Math.random().toString().slice(2); // todo: the session identifier, which can be used to validate login instead of the the credentials

            // update data on client side
            this.sendUserProfileChangedMessage();
            this.currentRoom.sendRoomChangedBroadcast();
        }

        return credentialsValid;
    }

    public refreshLobbyRoomData() {
        SocketMessenger.directMessageToSocket(this.socket, 'lobbyRoomsChanged', RoomManager.getLobbyMemberRoomData());
    }

    public createNewRoom() {
        if(this.verified && this.currentRoom.getRoomId() === 'lobby') {
            RoomManager.createRoom(this);
        }
    }

    public returnToLobby() {
        if(this.currentRoom.getRoomId() !== 'lobby') {
            RoomManager.getLobbyRoom().joinRoom(this);
        }
    }

}