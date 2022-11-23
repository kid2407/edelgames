import React from "react";
import EventManager from "../util/EventManager";
import {RoomEventNames, ServerRoomMember} from "../util/RoomManager";
import AbstractComponent from "./AbstractComponent";
import ProfileImage from "./ProfileImage";

type ForeignRoomObject = {
    roomId: string;
    roomName: string;
    roomMembers: ServerRoomMember[]
}

export default class RoomListBox extends AbstractComponent {

    constructor(props : any) {
        super(props);
        EventManager.subscribe(RoomEventNames.lobbyRoomsChangedEventNotified, this.onLobbyRoomsChangedEventNotified.bind(this));
        this.state = {
           rooms: []
        };
    }

    onLobbyRoomsChangedEventNotified(data: {rooms: ForeignRoomObject[]}) {
        let roomList: ForeignRoomObject[] = data.rooms;

        this.setStateSafe({
            rooms: roomList
        });
    }


    renderMember(member: ServerRoomMember) {
        return (
            <div className="member-list-row">
                <ProfileImage picture={member.picture}
                              username={member.username}
                              id={member.id} />
                {member.username}
            </div>
        );
    }

    renderRoom(room: ForeignRoomObject) {
        let roomColor = room.roomId === 'lobby' ? '#3188c3' : `hsl(${(parseInt(room.roomId,36) % 360)},50%,50%)`;

        return (
            <div className="room-overview-box"
                 style={{borderColor: roomColor}}>
                <div className="room-overview-box--room-data"
                     style={{backgroundColor: roomColor}}>{room.roomName}</div>
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
            </div>
        );
    }

}