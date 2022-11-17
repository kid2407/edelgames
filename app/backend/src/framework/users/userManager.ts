import User from "./user";

export default class UserManager {

    users: User[] = []

    constructor() {

    }

    addUser(socketId: string): void {
        let user = new User(socketId);
        this.users.push(user);
    }

    removeUser(socketId: string): void {
        this.users = this.users.filter((user) => user.id !== socketId);
    }

    getUserList(): object {
        return this.users.map((user: User) => {
            return {
                username: user.name
            }
        });
    }


}