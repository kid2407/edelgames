export default class SessionManager {

    sessionId: string|null;
    isLoggedIn: boolean;

    constructor() {
       this.sessionId = null;
       this.isLoggedIn = false;
    }

    connect() {

    }

    isConnected(): boolean {
        return this.sessionId !== null;
    }





}
