import {Socket} from "socket.io";
import Room from "./Room";
import SocketMessenger from "./util/SocketMessenger";
import RoomManager from "./RoomManager";
import debug from "./util/debug";
import ModuleRegistry from "./modules/ModuleRegistry";
import XenforoApi, {authDataContainer} from "./util/XenforoApi";

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

        // register generic listeners
        SocketMessenger.subscribeEventToSocket(socket, 'userLoginAttempt', this.authenticate.bind(this));
        SocketMessenger.subscribeEventToSocket(socket, 'refreshLobbyRoomData', this.refreshLobbyRoomData.bind(this));
        SocketMessenger.subscribeEventToSocket(socket, 'createNewRoom', this.createNewRoom.bind(this));
        SocketMessenger.subscribeEventToSocket(socket, 'returnToLobby', this.returnToLobby.bind(this));
        SocketMessenger.subscribeEventToSocket(socket, 'joinRoom', this.joinRoom.bind(this));
        SocketMessenger.subscribeEventToSocket(socket, 'startGame', this.startGame.bind(this));
        SocketMessenger.subscribeEventToSocket(socket, 'clientToServerGameMessage', this.onReceivedGameMessage.bind(this));
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

    public authenticate(loginData: {isAuthSessionId: boolean, username: string, password: string}): void {
        let {username, password} = loginData;

        if(this.verified) {
            return;
        }

        if(loginData.isAuthSessionId) {
            let sessionId = this.authSessionId ?? password;
            debug(1, `user ${this.id} attempted login with authId`);
            XenforoApi.sendTokenAuthRequest(sessionId, this.onAuthResponse.bind(this))
        }
        else {
            debug(1, `user ${this.id} attempted login as ${username} using password`);
            XenforoApi.sendAuthRequest(username, password, this.onAuthResponse.bind(this));
        }
    }

    public onAuthResponse(success: boolean, data: null|authDataContainer) {
        if(!success || !data) {
            // error -> todo: notify the user that he is dumb
            debug(1, `authentication attempt failed for user ${this.id}`);
            return;
        }

        this.verified = true;
        this.name = data.username;
        this.pictureUrl = data.profileImageUrl;
        this.authSessionId = data.authCookie;

        // update data on client side
        this.sendUserProfileChangedMessage();
        this.currentRoom.sendRoomChangedBroadcast();

        debug(1, `user ${this.id} authenticated as ${this.name}`);
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

    public joinRoom(data: {roomId: string, password: string|undefined|null}) {
        if(this.currentRoom.getRoomId() !== 'lobby') {
            return;
        }

        RoomManager.getRoomById(data.roomId).joinRoom(this, data.password);
    }

    public startGame(data: {gameId: string}) {
        if(this.currentRoom && this.currentRoom.getRoomMaster() === this && this.currentRoom.getCurrentGameId() === null) {
            ModuleRegistry.createGame(this.currentRoom, data.gameId);
        }
    }

    public onReceivedGameMessage(eventData: {messageTypeId: string, [key: string]: any}) {
        if(this.currentRoom) {
            this.currentRoom.onUserNotifiedGame(this.id, eventData.messageTypeId, eventData);
        }
    }

}