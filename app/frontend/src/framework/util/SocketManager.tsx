import {ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData} from "./socketIoTypes";
import { io, Socket } from "socket.io-client";

export default class SocketManager {

    static instance: SocketManager|null;

    socket: Socket<ServerToClientEvents, ClientToServerEvents>|null = null;
    sessionId: string|null = null;
    verified: boolean = false;

    constructor() {
        this.sessionId = null;
        this.verified = false;
        this.connect();
    }

    static getInstance(): SocketManager {
        if(!SocketManager.instance) {
            SocketManager.instance = new SocketManager();
        }
        return SocketManager.instance;
    }

    connect() {
        // todo: connect to backend
        const PORT = process.env.API_HTTP_PORT || 5000;
        const DOMAIN = process.env.DOMAIN || "http://localhost";

        this.socket = io(DOMAIN+":"+PORT);
    }

    isConnected(): boolean {
        return this.sessionId !== null;
    }

    isVerified(): boolean {
        return this.verified;
    }

}
