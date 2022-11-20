import React from 'react';
import PageHeader from "./components/PageHeader";
import SocketManagerSingleton, {SocketEventNames} from "./util/SocketManager";
import EventManagerSingleton from "./util/EventManager";
import ProfileManagerSingleton from "./util/ProfileManager";
import AbstractComponent from "./components/AbstractComponent";


export default class Core extends AbstractComponent {

    constructor(props: object) {
        super(props);
        SocketManagerSingleton.initiate();
        ProfileManagerSingleton.initiate();
        EventManagerSingleton.subscribe(SocketEventNames.connectionStatusChanged, this.onConnectionStatusChanged.bind(this));
    }

    onConnectionStatusChanged(): void {
        this.triggerRerender();
    }

    render() {
        // show loading spinner, until page is loaded
        if(!SocketManagerSingleton.isConnected()) {
            return (
                <div className="loadingSpinner"></div>
            );
        }

        return (
            <div id="pageWrap">
                <PageHeader />

                <div id="pageContent">
                    Helloworld
                </div>
            </div>
        );
    }
}
