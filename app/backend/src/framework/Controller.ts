import SocketMessenger from "./util/SocketMessenger";
import {Server, Socket} from "socket.io";
import User from "./users/User";
import RoomManager from "./users/RoomManager";

export default class Controller {

    public static io: Server;
    public static connectedUsers: number = 0;

    constructor(io: Server) {
        Controller.io = io;
    }

    onConnect(socket: Socket): void {
        // create user and register disconnect listener
        let user: User = new User(socket);
        socket.on('disconnect', this.onDisconnect.bind(this, socket, user));
        // switch user into lobby
        RoomManager.getLobbyRoom().joinRoom(user);

        // debug output
        Controller.connectedUsers++;
        console.log(`user ${socket.id} (${user.getUsername()}) connected! (${Controller.connectedUsers} users in total)`);
    }

    onDisconnect(socket: Socket, user: User): void {
        Controller.connectedUsers--;
        console.log(`user ${socket.id} (${user.getUsername()}) disconnected! (${Controller.connectedUsers} users remaining)`);
        user.destroyUser();
    }

}