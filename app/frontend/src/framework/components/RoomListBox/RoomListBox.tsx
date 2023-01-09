import React, {ReactNode} from "react";
import ProfileImage from "../ProfileImage/ProfileImage";
import eventManager, {EventDataObject} from "../../util/EventManager";
import {RoomEventNames, ServerRoomMember} from "../../util/RoomManager";
import socketManager from "../../util/SocketManager";
import profileManager from "../../util/ProfileManager";
import {clientLogger} from "../../util/Logger";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

type ForeignRoomObject = {
    roomId: string;
    roomName: string;
    requirePassphrase: boolean;
    roomMembers: ServerRoomMember[];
    allowJoin: boolean;
}

type ForeignRoomObjectList = {
    rooms: ForeignRoomObject[]
}

type IState = {
    rooms: ForeignRoomObject[]
}

/*
 * @description
 * Used for displaying infos about every available room and their members in the lobby
 */

export default class RoomListBox extends React.Component<{}, IState> {

    updateInterval: NodeJS.Timer | number | null = null;

    state: IState = {
        rooms: []
    };

    resetUpdateInterval(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    componentDidMount(): void {
        eventManager.subscribe(RoomEventNames.lobbyRoomsChangedEventNotified, this.onLobbyRoomsChangedEventNotified.bind(this));
        this.resetUpdateInterval();
        this.updateInterval = setInterval(this.onRefreshInterval.bind(this), 1000);
    }

    componentWillUnmount(): void {
        eventManager.unsubscribe(RoomEventNames.lobbyRoomsChangedEventNotified, this.onLobbyRoomsChangedEventNotified.bind(this));
        this.resetUpdateInterval();
    }

    onRefreshInterval(): void {
        if (this.state.rooms.length === 0) {
            socketManager.sendEvent('refreshLobbyRoomData', {});
        }
        else {
            // seems like we have got info about the rooms, so we can stop the interval
            this.resetUpdateInterval();
        }
    }

    onLobbyRoomsChangedEventNotified(data: EventDataObject): void {
        let roomList: ForeignRoomObject[] = (data as ForeignRoomObjectList).rooms;

        this.setState({
            rooms: roomList
        });
    }

    onCreateRoom(): void {
        socketManager.sendEvent(RoomEventNames.createNewRoom, {});
    }

    onJoinRoom(roomId: string, usePassword: boolean): void {
        let passphrase = null;
        if (usePassword) {
            passphrase = prompt('Enter room password: ', '');
        }
        clientLogger.debug(`Attempting to join room ${roomId} with passphrase ${passphrase}`);

        socketManager.sendEvent(RoomEventNames.joinRoom, {
            roomId: roomId,
            password: passphrase
        });
    }


    render(): ReactNode {
        return (
            <div id="roomListBox">
                {this.state.rooms.map(this.renderRoom.bind(this))}

                {!profileManager.isVerified() ? null :
                    <div className="room-overview-box room-create-box">

                        <div className="room-overview-box--room-data">Create Room</div>
                        <div className="room-overview-box--member-list"
                             onClick={this.onCreateRoom.bind(this)}>
                            <FontAwesomeIcon icon={['fad', 'plus']} size="3x" />
                        </div>

                    </div>
                }
            </div>
        );
    }

    renderRoom(room: ForeignRoomObject): ReactNode {
        let roomColor = room.roomId === 'lobby' ?
            '#3188c3' :
            `hsl(${(parseInt(room.roomId, 36) % 360)},70%,30%)`;

        return (
            <div className="room-overview-box"
                 key={room.roomId}
                 style={{borderColor: roomColor}}>

                <div className="room-overview-box--room-data"
                     style={{backgroundColor: roomColor}}>
                    <span className="text-align-left">
                        {room.roomName}
                        {room.requirePassphrase ?
                            <FontAwesomeIcon icon={['fad', 'lock']} size="1x" />
                            : null}
                    </span>
                    {
                        (room.roomId === 'lobby' || !room.allowJoin) ? null :
                            <span className="text-align-right">
                                <span className="room-join-button"
                                      onClick={this.onJoinRoom.bind(this, room.roomId, room.requirePassphrase)}>
                                    <FontAwesomeIcon icon={['fad', 'plus']} size="1x" />
                                </span>
                            </span>
                    }
                </div>

                <div className="room-overview-box--member-list">
                    {room.roomMembers.map(this.renderMember.bind(this))}
                </div>

            </div>
        );
    }

    renderMember(member: ServerRoomMember): ReactNode {
        return (
            <div key={member.id} className="member-list-row">
                <ProfileImage picture={member.picture}
                              username={member.username}
                              id={member.id}/>
                {member.username}
            </div>
        );
    }

}