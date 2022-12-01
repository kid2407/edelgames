import React from "react";
import EventManager from "../../util/EventManager";
import RoomManager, {RoomEventNames} from "../../util/RoomManager";
import AbstractComponent from "../AbstractComponent";
import User from "../../util/User";
import ProfileImage from "../ProfileImage/ProfileImage";
import ProfileManager from "../../util/ProfileManager";

/*
 * @description
 * Used for displaying infos about the current room and its members
 */

export default class RoomOverviewBox extends AbstractComponent {

    constructor(props : any) {
        super(props);
        EventManager.subscribe(RoomEventNames.roomUpdated, this.onRoomUpdated.bind(this))
    }

    onRoomUpdated() {
        this.triggerRerender();
    }


    renderMember(member: User) {
        return (
            <div className="member-list-row" key={member.getId()}>
                <ProfileImage picture={member.getPicture()}
                              username={member.getUsername()}
                              id={member.getId()} />
                {member.getUsername()}
                {(member.getId() === ProfileManager.getId() ? <span>&nbsp;(You)</span> : null)}
                {(member.isRoomMaster() ? <span className="signature-text">&nbsp;A</span> : null)}
            </div>
        );
    }

    render() {
        return (
            <div className="room-overview-box">
                <div className="room-overview-box--room-data">
                    {RoomManager.getRoomName()}
                </div>

                <div className="room-overview-box--member-list">
                    {RoomManager.getRoomMembers().map(this.renderMember)}
                </div>
            </div>
        );
    }

}