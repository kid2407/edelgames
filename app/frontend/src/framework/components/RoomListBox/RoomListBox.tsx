import React from "react";
import EventManager from "../../util/EventManager";
import {RoomEventNames, ServerRoomMember} from "../../util/RoomManager";
import AbstractComponent from "../AbstractComponent";
import ProfileImage from "../ProfileImage/ProfileImage";
import SocketManager from "../../util/SocketManager";
import ProfileManager from "../../util/ProfileManager";
import debug from "../../util/debug";

type ForeignRoomObject = {
    roomId: string;
    roomName: string;
    roomMembers: ServerRoomMember[];
    roomUsePassword: boolean;
}

/*
 * @description
 * Used for displaying infos about every available room and their members in the lobby
 */

export default class RoomListBox extends AbstractComponent {

    updateInterval: NodeJS.Timer|number|null = null;

    constructor(props : any) {
        super(props);

        EventManager.subscribe(RoomEventNames.lobbyRoomsChangedEventNotified, this.onLobbyRoomsChangedEventNotified.bind(this));
        this.state = {
           rooms: []
        };

        this.updateInterval = setInterval(this.onRefreshInterval.bind(this), 1000);
    }

    componentWillUnmount() {
        if(this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    onRefreshInterval() {
        if(this.state.rooms.length === 0) {
            SocketManager.sendEvent('refreshLobbyRoomData', {});
        }
        else if(this.updateInterval) {
            // seems like we have got info about the rooms, so we can stop the interval
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    onLobbyRoomsChangedEventNotified(data: {rooms: ForeignRoomObject[]}) {
        let roomList: ForeignRoomObject[] = data.rooms;

        this.setStateSafe({
            rooms: roomList
        });
    }

    onCreateRoom() {
        SocketManager.sendEvent('createNewRoom', {});
    }

    onJoinRoom(roomId: string, usePassword: boolean) {
        let passphrase = null;
        if(usePassword) {
            passphrase = prompt('Enter room password: ', '');
        }
        debug(`Attempting to join room ${roomId} with passphrase ${passphrase}`);

        SocketManager.sendEvent('joinRoom', {
            roomId: roomId,
            password: passphrase
        });
    }



    renderMember(member: ServerRoomMember) {
        return (
            <div key={member.id} className="member-list-row">
                <ProfileImage picture={member.picture}
                              username={member.username}
                              id={member.id} />
                {member.username}
            </div>
        );
    }

    renderRoom(room: ForeignRoomObject) {
        let roomColor = room.roomId === 'lobby' ? '#3188c3' : `hsl(${(parseInt(room.roomId,36) % 360)},70%,50%)`;

        return (
            <div className="room-overview-box"
                 key={room.roomId}
                 style={{borderColor: roomColor}}>

                <div className="room-overview-box--room-data"
                     style={{backgroundColor: roomColor}}>
                    <span className="text-align-left">{room.roomName}</span>
                    {
                        (room.roomId === 'lobby') ? null :
                        <span className="text-align-right">
                            <span className="room-join-button" onClick={this.onJoinRoom.bind(this, room.roomId, room.roomUsePassword)}>+</span>
                            {room.roomUsePassword ? <span>l</span> : null}
                        </span>
                    }
                </div>

                <div className="room-overview-box--member-list">
                    {room.roomMembers.map(this.renderMember.bind(this))}
                </div>

            </div>
        );
    }

    render() {
        return (
            <div id="roomListBox">
                {this.state.rooms.map(this.renderRoom.bind(this))}

                {!ProfileManager.isVerified() ? null :
                    <div className="room-overview-box room-create-box">

                        <div className="room-overview-box--room-data">Create Room</div>
                        <div className="room-overview-box--member-list"
                             onClick={this.onCreateRoom.bind(this)}>+</div>

                    </div>
                }
            </div>
        );
    }

}