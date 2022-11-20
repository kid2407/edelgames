import UserManager from "./users/UserManager";
import SocketMessenger from "./users/SocketMessenger";
import {Server, Socket} from "socket.io";
import User from "./users/User";

export default class Controller {

    public static io: Server;

    constructor(io: Server) {
        Controller.io = io;
    }


    userManager: UserManager = new UserManager();

    onConnect(socket: Socket): void {
        // register disconnect listener
        socket.on('disconnect', this.onDisconnect.bind(this, socket));
        // create and store user object
        let user: User = this.userManager.addUser(socket);

        // debug output
        let userCount = this.userManager.getUserList().length;
        console.log(`user ${socket.id} connected! (${userCount} users in total)`);

        let currentRoom = user.getRoom();
        // tell the client its new profile data
        SocketMessenger.directMessage(socket.id, 'profileChanged', {
            username: user.getUsername(),
            id: user.getId(),
            room: currentRoom,
            screen: user.getCurrentScreen(),
            pictureUrl: user.getPictureUrl(),
            verified: user.isVerified()
        })

        // tell everyone in this room the new userlist
        SocketMessenger.broadcast(currentRoom, 'userListChanged', this.userManager.getPublicRoomList(currentRoom));
    }

    onDisconnect(socket: Socket): void {
        let user = this.userManager.removeUser(socket);

        let userCount = this.userManager.getUserList().length;
        console.log(`user ${socket.id} disconnected! (${userCount} users remaining)`);

        let affectedRoom = user.getRoom();
        SocketMessenger.broadcast(affectedRoom, 'userListChanged', this.userManager.getPublicRoomList(affectedRoom));
    }



}