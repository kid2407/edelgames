import { io, Socket } from "socket.io-client";
import EventManagerSingleton, {EventNameListObj} from "./EventManager";

export const SocketEventNames: EventNameListObj = {
    connectionStatusChanged: "connectionStatusChanged"
}

type ListenerFunction = (data: object) => void;

export class SocketManagerSingleton {

    private readonly socket: Socket;

    constructor() {
        const PORT = process.env.API_HTTP_PORT || 5000;
        const DOMAIN = process.env.DOMAIN || "http://localhost";

        this.socket = io(DOMAIN+":"+PORT);
        this.socket.on("connect", this.onConnectionStatusChanged.bind(this));
        this.socket.on("disconnect", this.onConnectionStatusChanged.bind(this));
        this.socket.on("connect_error", this.onConnectionStatusChanged.bind(this));
        this.socket.io.on("reconnect", this.onConnectionStatusChanged.bind(this));
    }

    private onConnectionStatusChanged(): void {
        EventManagerSingleton.publish(SocketEventNames.connectionStatusChanged);
    }

    public isConnected(): boolean {
        return !!this.socket?.connected;
    }

    public getSocket(): Socket {
        return this.socket;
    }

    public sendEvent(eventName: string, data: object): void {
        this.socket.emit(eventName, data);
    }

    public subscribeEvent(eventName: string, listener: ListenerFunction): void {
        this.socket.on(eventName, listener);
    }
}

const SocketManager = new SocketManagerSingleton();
export default SocketManager;