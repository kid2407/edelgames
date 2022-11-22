import React from 'react';
import PageHeader from "./components/PageHeader";
import EventManagerSingleton from "./util/EventManager";
import AbstractComponent from "./components/AbstractComponent";
import Lobby from "./screens/Lobby";
import SocketManager, {SocketEventNames, SocketManagerSingleton} from "./util/SocketManager";
import ProfileManager, {ProfileManagerSingleton} from "./util/ProfileManager";


export default class Core extends AbstractComponent {

    private socketManager : SocketManagerSingleton;
    private profileManager : ProfileManagerSingleton;

    constructor(props: object) {
        super(props);

        // load objects to create an instance and kickoff some functionality
        this.socketManager = SocketManager;
        this.profileManager = ProfileManager;
        EventManagerSingleton.subscribe(SocketEventNames.connectionStatusChanged, this.onConnectionStatusChanged.bind(this));
    }


    onConnectionStatusChanged(): void {
        this.triggerRerender();
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
                    <Lobby />
                </div>
            </div>
        );
    }
}
