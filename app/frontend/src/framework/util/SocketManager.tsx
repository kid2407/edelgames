import {io, Socket} from "socket.io-client";
import eventManager, {ListenerFunction} from "./EventManager";
import {clientLogger} from "./Logger";


// helper constants don`t need a type, as it is recognized by the value
export const SocketEventNames = {
    connectionStatusChanged: "connectionStatusChanged"
}


class SocketManager {

    protected readonly socket: Socket;

    constructor() {
        const PORT = process.env.REACT_APP_API_HTTP_PORT || 5000;
        const DOMAIN = process.env.REACT_APP_DOMAIN || "http://localhost";
        clientLogger.debug('Starting connection using domain ', process.env, `Resultung in ${DOMAIN}:${PORT}`);

        this.socket = io(DOMAIN + ":" + PORT);
        this.socket.on("connect", this.onConnectionStatusChanged.bind(this, true));
        this.socket.on("disconnect", this.onConnectionStatusChanged.bind(this, false));
        this.socket.on("connect_error", this.onConnectionStatusChanged.bind(this, false));
        this.socket.io.on("reconnect", this.onConnectionStatusChanged.bind(this, true));
    }

    protected onConnectionStatusChanged(status: boolean): void {
        eventManager.publish(SocketEventNames.connectionStatusChanged, {connected: status});
    }

    public isConnected(): boolean {
        return !!this.socket?.connected;
    }

    public getSocket(): Socket {
        return this.socket;
    }

    public sendEvent(eventName: string, data: object): void {
        clientLogger.debug(`Sending event ${eventName} with `, data.hasOwnProperty("password") ? 'data' : data);
        this.socket.emit(eventName, data);
    }

    public subscribeEvent(eventName: string, listener: ListenerFunction): void {
        clientLogger.debug(`Subscribing event ${eventName} with `, listener);
        this.socket.on(eventName, listener);
    }
}

const socketManager = new SocketManager();
export default socketManager;
export type SocketManagerType = typeof socketManager;