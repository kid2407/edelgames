export default class SessionManager {

    static instance: SessionManager|null;

    sessionId: string|null;
    isLoggedIn: boolean;

    constructor() {
       this.sessionId = null;
       this.isLoggedIn = false;
    }

    static getInstance(): SessionManager {
        if(!SessionManager.instance) {
            SessionManager.instance = new SessionManager();
        }
        return SessionManager.instance;
    }


    connect() {

    }

    isConnected(): boolean {
        return this.sessionId !== null;
    }





}
