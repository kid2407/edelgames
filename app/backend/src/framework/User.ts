import {Socket} from "socket.io";
import Room from "./Room";
import SocketManager from "./util/SocketManager";
import RoomManager from "./RoomManager";
import ModuleRegistry from "./modules/ModuleRegistry";
import XenforoApi, {authDataContainer} from "./util/XenforoApi";
import {systemLogger} from "./util/Logger";

export default class User {

    private readonly id: string = ""; // required for identifying users with the same name
    private name: string = ""; // basically the username or guest_{id}
    private verified: boolean = false; // true, if the user did authenticate itself by login
    private currentRoom: Room | null = null;
    private pictureUrl: string | null = null;
    private authSessionId: string | null = null;
    private readonly socket: Socket;

    constructor(socket: Socket) {
        this.socket = socket;
        this.id = this.createIdHash();
        this.name = 'guest_' + this.id;
        this.sendUserProfileChangedMessage();

        // register generic listeners
        SocketManager.subscribeEventToSocket(socket, 'userLoginAttempt', this.authenticate.bind(this));
        SocketManager.subscribeEventToSocket(socket, 'refreshLobbyRoomData', this.onRefreshLobbyRoomData.bind(this));
        SocketManager.subscribeEventToSocket(socket, 'createNewRoom', this.onCreateNewRoom.bind(this));
        SocketManager.subscribeEventToSocket(socket, 'returnToLobby', this.onReturnToLobby.bind(this));
        SocketManager.subscribeEventToSocket(socket, 'joinRoom', this.onJoinRoom.bind(this));
        SocketManager.subscribeEventToSocket(socket, 'startGame', this.onStartGame.bind(this));
        SocketManager.subscribeEventToSocket(socket, 'clientToServerGameMessage', this.onReceivedGameMessage.bind(this));
        SocketManager.subscribeEventToSocket(socket, 'returnToGameSelection', this.onGameCancelRequested.bind(this));
        SocketManager.subscribeEventToSocket(socket, 'changeRoomName', this.onRoomNameChangeRequested.bind(this));
        SocketManager.subscribeEventToSocket(socket, 'changeRoomPass', this.onRoomPassChangeRequested.bind(this));
    }

    /** This will remove the user from its current room, hopefully leaving no reference behind. Thus allowing it to be cleared by the garbage collection
     *  Usually, this happens, when the user disconnects
     */
    destroyUser() {
        if (this.currentRoom) {
            this.currentRoom.removeUserFromRoom(this);
            this.currentRoom = null;
        }
    }

    public getUsername(): string {
        return this.name;
    }

    public getId(): string {
        return this.id;
    }

    public getPictureUrl(): string | null {
        return this.pictureUrl;
    }

    public getCurrentRoom(): Room | null {
        return this.currentRoom;
    }

    public getSocket(): Socket {
        return this.socket;
    }

    public isVerified(): boolean {
        return this.verified;
    }

    private createIdHash(): string {
        return Math.random().toString(36).slice(2).substring(0, 5);
    }

    /**
     * Switches the user to the given room. SocketIo allows for multiple rooms at once, but we only want one at a time, so we leave the last one
     */
    public async switchRoom(newRoom: Room): Promise<any> {
        await this.socket.join(newRoom.getRoomId());

        if (this.currentRoom) {
            this.socket.leave(this.currentRoom.getRoomId());
            this.currentRoom.removeUserFromRoom(this);
        }

        this.currentRoom = newRoom;
    }

    public messageUser(eventName: string, data: object): void {
        SocketManager.directMessageToSocket(this.socket, eventName, data);
    }

    private sendUserProfileChangedMessage(): void {
        this.messageUser('profileChanged', {
            id: this.id,
            username: this.name,
            pictureUrl: this.pictureUrl,
            verified: this.verified,
            authSessionId: this.authSessionId
        })
    }

    public authenticate(loginData: { isAuthSessionId: boolean, username: string, password: string }): void {
        let {username, password} = loginData;

        if (this.verified) {
            return;
        }

        if (loginData.isAuthSessionId) {
            let sessionId = this.authSessionId ?? password;
            systemLogger.info(`user ${this.id} attempted login with authId`);
            XenforoApi.loginWithToken(sessionId, this.onAuthResponse.bind(this))
        } else {
            systemLogger.info(`user ${this.id} attempted login as ${username} using password`);
            XenforoApi.loginWithPassword(username, password, this.onAuthResponse.bind(this))
        }
    }

    /**
     * @internal
     * @param success
     * @param data
     */
    public onAuthResponse(success: boolean, data: null | authDataContainer): void {
        if (!success || !data) {
            systemLogger.info(`authentication attempt failed for user ${this.id}`);
            SocketManager.sendNotificationBubbleToSocket(this.socket, 'Authentication failed!', 'error');
            return;
        }

        this.verified = true;
        this.name = data.username;
        this.pictureUrl = data.profileImageUrl;
        this.authSessionId = data.authCookie;

        // update data on client side
        this.sendUserProfileChangedMessage();
        this.currentRoom.sendRoomChangedBroadcast();

        systemLogger.info(`user ${this.id} authenticated as ${this.name}`);
    }

    public onRefreshLobbyRoomData(): void {
        SocketManager.directMessageToSocket(this.socket, 'lobbyRoomsChanged', RoomManager.getLobbyMemberRoomData());
    }

    public onCreateNewRoom(): void {
        if (this.verified && this.currentRoom.getRoomId() === 'lobby') {
            RoomManager.createRoom(this);
        }
    }

    public onReturnToLobby(): void {
        if (this.currentRoom.getRoomId() !== 'lobby') {
            RoomManager.getLobbyRoom().joinRoom(this);
        }
    }

    public onJoinRoom(data: { roomId: string, password: string | undefined | null }) {
        if (this.currentRoom.getRoomId() !== 'lobby') {
            return;
        }

        RoomManager.getRoomById(data.roomId).joinRoom(this, data.password);
    }

    public onStartGame(data: { gameId: string }): void {
        if (this.currentRoom && this.currentRoom.getRoomMaster() === this && this.currentRoom.getCurrentGameId() === null) {
            ModuleRegistry.createGame(this.currentRoom, data.gameId);
        }
    }

    public onReceivedGameMessage(eventData: { messageTypeId: string, [key: string]: any }): void {
        if (this.currentRoom) {
            this.currentRoom.onUserNotifiedGame(this.id, eventData.messageTypeId, eventData);
        }
    }

    public onGameCancelRequested(eventData: { messageTypeId: string, [key: string]: any }): void {
        if (this.currentRoom && this.currentRoom.getRoomMaster() === this &&
            this.currentRoom.getCurrentGameId())
        {
            this.currentRoom.setCurrentGame(null);
            for(let user of this.currentRoom.getRoomMembers()) {
                SocketManager.sendNotificationBubbleToSocket(user.getSocket(), `${this.getUsername()} hat das Spiel beendet`, "info");
            }
        }
    }

    public onRoomNameChangeRequested(eventData: { messageTypeId: string, [key: string]: any }): void {
        let newRoomName = eventData.newRoomName || '';

        if(this.currentRoom && this.currentRoom.getRoomMaster() === this &&
            newRoomName.length > 5 && newRoomName.length <= 30)
        {

            this.currentRoom.setRoomName(newRoomName.substring(0, 30));
        }
    }

    public onRoomPassChangeRequested(eventData: { messageTypeId: string, [key: string]: any }): void {
        let newPassword = eventData.newPassword || '';

        if(this.currentRoom && this.currentRoom.getRoomMaster() === this && newPassword.length <= 50)
        {
            this.currentRoom.setRoomPassword(newPassword || null);
        }
    }

}