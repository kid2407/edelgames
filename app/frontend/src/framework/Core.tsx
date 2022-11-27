import React from 'react';
import PageHeader from "./components/PageHeader/PageHeader";
import EventManagerSingleton from "./util/EventManager";
import AbstractComponent from "./components/AbstractComponent";
import Lobby from "./screens/Lobby/Lobby";
import SocketManager, {SocketEventNames, SocketManagerSingleton} from "./util/SocketManager";
import ProfileManager, {ProfileManagerSingleton} from "./util/ProfileManager";
import RoomManager, {RoomEventNames} from "./util/RoomManager";
import IdleRoom from "./screens/IdleRoom/IdleRoom";


export default class Core extends AbstractComponent {

    private socketManager : SocketManagerSingleton;
    private profileManager : ProfileManagerSingleton;

    constructor(props: object) {
        super(props);

        // load objects to create an instance and kickoff some functionality
        this.socketManager = SocketManager;
        this.profileManager = ProfileManager;
        EventManagerSingleton.subscribe(SocketEventNames.connectionStatusChanged, this.triggerRerender.bind(this));
        EventManagerSingleton.subscribe(RoomEventNames.roomUpdated, this.triggerRerender.bind(this));
    }


    renderRoomScreen() {
        switch (RoomManager.getRoomId()) {
            case 'lobby':
                return (<Lobby />);
            case 'idle':
                return (<IdleRoom />);
            default:
                return (<IdleRoom />);
        }
    }

    render() {
        // show loading spinner, until page is loaded
        if(!this.socketManager.isConnected()) {
            return (
                <div className="loadingSpinner"></div>
            );
        }

        return (
            <div id="pageWrap">
                <PageHeader />

                <div id="pageContent">
                    {this.renderRoomScreen()}
                </div>
            </div>
        );
    }
}
