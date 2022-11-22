import React from "react";
import EventManager from "../util/EventManager";
import RoomManager, {RoomEventNames} from "../util/RoomManager";
import AbstractComponent from "./AbstractComponent";
import User from "../util/User";
import ProfileImage from "./ProfileImage";

export default class RoomListBox extends AbstractComponent {

    constructor(props : any) {
        super(props);
        EventManager.subscribe(RoomEventNames.roomUpdated, this.onRoomUpdated.bind(this))
    }

    onRoomUpdated() {
        this.triggerRerender();
    }


    renderMember(member: User) {
        return (
            <div>
                <ProfileImage picture={member.getPicture()}
                              username={member.getUsername()}
                              id={member.getId()} />
                {member.getUsername()}
            </div>
        );
    }

    render() {
        return (
            <div id="roomListBox">
                {RoomManager.getRoomMembers().map(this.renderMember)}
            </div>
        );
    }

}