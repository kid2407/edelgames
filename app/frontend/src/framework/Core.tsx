import React, {ReactNode} from 'react';
import PageHeader from "./components/PageHeader/PageHeader";
import Lobby from "./screens/Lobby/Lobby";
import IdleRoom from "./screens/IdleRoom/IdleRoom";
import GameRoom from "./screens/GameRoom/GameRoom";
import NotificationBubble from "./components/NotificationBubble/NotificationBubble";
import eventManager from "./util/EventManager";
import socketManager, {SocketEventNames} from "./util/SocketManager";
import roomManager, {RoomEventNames} from "./util/RoomManager";
import debug from "./util/debug";
import profileManager from "./util/ProfileManager";

export default class Core extends React.Component {

    constructor(props: object) {
        super(props);

        // important debug statement, as it initialises the profile manager and its event listeners.
        // even if this would be removed, a reference to the profileManager object has to stay!
        debug(typeof profileManager + ' loaded');
    }

    componentDidMount() {
        eventManager.subscribe(SocketEventNames.connectionStatusChanged, this.triggerRerender.bind(this));
        eventManager.subscribe(RoomEventNames.roomUpdated, this.triggerRerender.bind(this));
    }

    componentWillUnmount() {
        eventManager.unsubscribe(SocketEventNames.connectionStatusChanged, this.triggerRerender.bind(this));
        eventManager.unsubscribe(RoomEventNames.roomUpdated, this.triggerRerender.bind(this));
    }

    triggerRerender(): void {
        this.setState({});
    }

    render(): ReactNode {
        // show loading spinner, until page is loaded
        if (!socketManager.isConnected()) {
            return (
                <div className="loadingSpinner"></div>
            );
        }

        return (
            <div id="pageWrap">
                <PageHeader/>

                <div id="pageContent">
                    {this.renderRoomScreen()}
                </div>

                <NotificationBubble/>
            </div>
        );
    }

    renderRoomScreen(): ReactNode {
        // if our current room is the lobby, show the lobby object
        if (roomManager.getRoomId() === 'lobby') {
            return (<Lobby/>);
        }

        // if there is any game id selected, show the game room
        if (roomManager.getCurrentGameId()) {
            return (<GameRoom/>);
        }

        // if we are not in the lobby and don't have a selected game, show the idle room
        return (<IdleRoom/>);
    }
}
