export default class User {

    public id: string = ""
    public name: string = ""
    public isVerified: boolean = false

    constructor(socketId: string) {
        this.id = socketId;
        this.name = 'guest_'+socketId.substring(0, 4);
    }


}