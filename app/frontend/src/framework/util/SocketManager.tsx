import { io, Socket } from "socket.io-client";
import EventManagerSingleton, {EventNameListObj} from "./EventManager";

export const SocketEventNames: EventNameListObj = {
    connectionStatusChanged: "connectionStatusChanged"
}

type ListenerFunction = (data: object) => void;


class SocketManager {

    socket: Socket;

    constructor() {
        // todo: connect to backend
        const PORT = process.env.API_HTTP_PORT || 5000;
        const DOMAIN = process.env.DOMAIN || "http://localhost";

        this.socket = io(DOMAIN+":"+PORT);
        this.socket.on("connect", this.onConnectionStatusChanged.bind(this));
        this.socket.on("disconnect", this.onConnectionStatusChanged.bind(this));
        this.socket.on("connect_error", this.onConnectionStatusChanged.bind(this));
        this.socket.io.on("reconnect", this.onConnectionStatusChanged.bind(this));
    }

    onConnectionStatusChanged(): void {
        EventManagerSingleton.publish(SocketEventNames.connectionStatusChanged);
    }

    isConnected(): boolean {
        return !!this.socket?.connected;
    }

    getSocket(): Socket {
        return this.socket;
    }

}


export default class SocketManagerSingleton {

    private static instance: SocketManager|null;

    private static getInstance(): SocketManager {
        if(!SocketManagerSingleton.instance) {
            SocketManagerSingleton.instance = new SocketManager();
        }
        return SocketManagerSingleton.instance;
    }

    public static initiate(): void {
        // just call the getInstance method to generate a socket manager and start connection
        // this way, we prevent other classes from executing the connect method
        SocketManagerSingleton.getInstance();
    }

    public static isConnected(): boolean {
        return SocketManagerSingleton.getInstance().isConnected();
    }

    public static sendEvent(eventName: string, data: object): void {
        SocketManagerSingleton.getInstance().getSocket().emit(eventName, data);
    }

    public static subscribeEvent(eventName: string, listener: ListenerFunction): void {
        SocketManagerSingleton.getInstance().getSocket().on(eventName, listener);
    }

}