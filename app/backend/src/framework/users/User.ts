import {Socket} from "socket.io";

export default class User {

    private readonly id: string = ""; // required for identifying users with the same name
    private name: string = ""; // basically the username or guest_{id}
    private currentScreen: string = "lobby"; // tells the client, which screen to display
    private room: string = "lobby"; // determines, which socketIo room the user is currently in
    private verified: boolean = false; // true, if the user did authenticate itself by login
    private pictureUrl: string|null = null;
    private readonly socket: Socket;

    constructor(socket: Socket) {
        this.socket = socket;
        this.socket.join(this.room);
        this.id = this.createIdHash(socket.id);
        this.name = 'guest_'+this.id;
    }

    public getUsername():       string      {return this.name;}
    public getId():             string      {return this.id;}
    public getRoom():           string      {return this.room;}
    public getPictureUrl():     string|null {return this.pictureUrl;}
    public getCurrentScreen():  string      {return this.currentScreen;}
    public getSocket():         Socket      {return this.socket;}
    public isVerified():        boolean     {return this.verified;}

    private createIdHash(socketId: string): string {
        let hash = '', vh, vl;

        for(let i=0; i < socketId.length; i++ ) {
            let char = socketId.charCodeAt(i);
            vh = (char >>> (i*4+4)) & 0x0f;
            vl = (char >>> (i*4)) & 0x0f;
            hash += vh.toString(16) + vl.toString(16);
        }
        return hash;
    }

    /**
     * Switches the user to the given room and returns the old one for exit messages and stuff.
     * SocketIo allows for multiple rooms at once, but we only want one at a time
     */
    public joinRoom(newRoom: string): string {
        let oldRoom = this.room;

        this.socket.leave(oldRoom);
        this.socket.join(newRoom);

        return oldRoom;
    }

    public authenticate(username: string, password: string): boolean {
        // todo try login with the xenforo api
        let credentialsValid = true; // for now, let all attempts succeed
        if(credentialsValid) {
            this.verified = true;
            this.name = username;
            this.pictureUrl = 'xyz'; // todo retrieve picture
        }

        return credentialsValid;
    }

}