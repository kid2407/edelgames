/**
 * A generic user object, that will be used to store data of other users
 */

export default class User {

    private readonly id: string;
    private readonly username: string;
    private readonly picture: string|null;
    private readonly roomMaster: boolean;

    constructor(id: string, username: string, picture: string|null, roomMaster: boolean) {
        this.id = id;
        this.username = username;
        this.picture = picture;
        this.roomMaster = roomMaster;
    }

    public getUsername():    string      {return this.username; }
    public getId():          string      {return this.id; }
    public getPicture():     string|null {return this.picture; }
    public isRoomMaster():   boolean     {return this.roomMaster; }
}