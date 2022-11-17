import UserManager from "./users/userManager";
import {Server} from "socket.io";
import SocketMessenger from "./users/socketMessenger";

export default class Controller {

    static io: Server;
    userManager: UserManager = new UserManager();

    constructor(io: Server) {
        Controller.io = io;
    }

    onConnect(socket: any): void {
        console.log(`user ${socket.id} connected`);
        socket.on('disconnect', this.onDisconnect.bind(this));

        this.userManager.addUser(socket.id);
        SocketMessenger.broadcast('userListChanged', this.userManager.getUserList());
    }

    onDisconnect(socket: any): void {
        console.log(`user ${socket.id} disconnected`);
        this.userManager.removeUser(socket.id);
        SocketMessenger.broadcast('userListChanged', this.userManager.getUserList());
    }



}