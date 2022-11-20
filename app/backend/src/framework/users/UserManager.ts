import User from "./User";
import {Socket} from "socket.io";

export default class UserManager {

    users: User[] = []

    constructor() {
    }

    addUser(socket: Socket): User {
        let user = new User(socket);
        this.users.push(user);
        return user;
    }

    removeUser(socket: Socket): User|null {
        let removedUser = this.users.filter((user) => user.getSocket() === socket)[0] || null;
        this.users      = this.users.filter((user) => user.getSocket() !== socket);
        return removedUser;
    }

    getUserList(): User[] {
        return this.users;
    }

    getPublicRoomList(room: string): object[] {
        let roomList = [];

        for(let user of this.users) {
            if(user.getRoom() === room) {
                roomList.push({
                    username: user.getUsername(),
                    id: user.getId(),
                    pictureUrl: user.getPictureUrl()
                });
            }
        }


        return roomList;
    }

}