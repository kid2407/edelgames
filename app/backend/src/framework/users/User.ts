import {Socket} from "socket.io";
import Room from "./Room";
import SocketMessenger from "../util/SocketMessenger";

export default class User {

    private readonly id: string = ""; // required for identifying users with the same name
    private name: string = ""; // basically the username or guest_{id}
    private verified: boolean = false; // true, if the user did authenticate itself by login
    private currentScreen: string = "lobby"; // tells the client, which screen to display
    private currentRoom: Room|null = null;
    private pictureUrl: string|null = null;
    private readonly socket: Socket;

    constructor(socket: Socket) {
        this.socket = socket;
        this.id = this.createIdHash();
        this.name = 'guest_'+this.id;
        this.sendUserProfileChangedMessage();
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
    public getCurrentScreen():  string      {return this.currentScreen;}
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
        if(this.currentRoom) {
            this.socket.leave(this.currentRoom.getRoomId());
            this.currentRoom.removeUserFromRoom(this);
        }
        this.currentRoom = newRoom;
        await this.socket.join(newRoom.getRoomId());
    }

    public messageUser(eventName: string, data: object) {
        SocketMessenger.directMessageToSocket(this.socket, eventName, data);
    }

    private sendUserProfileChangedMessage() {
        this.messageUser('profileChanged', {
            id: this.id,
            username: this.name,
            screen: this.currentScreen,
            pictureUrl: this.pictureUrl,
            verified: this.verified
        })
    }

    public authenticate(username: string, password: string): boolean {
        // todo try login with the xenforo api
        let credentialsValid = true; // for now, let all attempts succeed
        if(credentialsValid) {
            this.verified = true;
            this.name = username;
            this.pictureUrl = 'https://edelmaenner.net/data/avatars/m/0/324.jpg?1587625532'; // todo retrieve picture url

            // update data on client side
            this.sendUserProfileChangedMessage();
            this.currentRoom.sendRoomChangedBroadcast();
        }

        return credentialsValid;
    }

}