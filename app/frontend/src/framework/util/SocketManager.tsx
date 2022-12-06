import { io, Socket } from "socket.io-client";
import EventManagerSingleton, {EventNameListObj} from "./EventManager";
import debug from "./debug";

export const SocketEventNames: EventNameListObj = {
    connectionStatusChanged: "connectionStatusChanged"
}

type ListenerFunction = (data: object) => void;

export class SocketManagerSingleton {

    private readonly socket: Socket;

    constructor() {
        const PORT = process.env.REACT_APP_API_HTTP_PORT || 5000;
        const DOMAIN = process.env.REACT_APP_DOMAIN || "http://localhost";
        console.log("Domain: ", DOMAIN)
        console.log("Port: ", PORT)
        console.log("This is a test!", process.env)

        this.socket = io(DOMAIN+":"+PORT);
        this.socket.on("connect", this.onConnectionStatusChanged.bind(this, true));
        this.socket.on("disconnect", this.onConnectionStatusChanged.bind(this, false));
        this.socket.on("connect_error", this.onConnectionStatusChanged.bind(this, false));
        this.socket.io.on("reconnect", this.onConnectionStatusChanged.bind(this, true));
    }

    private onConnectionStatusChanged(status: boolean): void {
        EventManagerSingleton.publish(SocketEventNames.connectionStatusChanged, {connected: status});
    }

    public isConnected(): boolean {
        return !!this.socket?.connected;
    }

    public getSocket(): Socket {
        return this.socket;
    }

    public sendEvent(eventName: string, data: object): void {
        debug(`Sending event ${eventName} with `, data);
        this.socket.emit(eventName, data);
    }

    public subscribeEvent(eventName: string, listener: ListenerFunction): void {
        debug(`Subscribing event ${eventName} with `, listener);
        this.socket.on(eventName, listener);
    }
}

const SocketManager = new SocketManagerSingleton();
export default SocketManager;