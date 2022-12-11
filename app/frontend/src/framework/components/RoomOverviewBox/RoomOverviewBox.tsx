import React, {ReactNode} from "react";
import roomManager, {RoomEventNames} from "../../util/RoomManager";
import User from "../../util/User";
import ProfileImage from "../ProfileImage/ProfileImage";
import eventManager from "../../util/EventManager";
import profileManager from "../../util/ProfileManager";

/*
 * @description
 * Used for displaying infos about the current room and its members
 */

export default class RoomOverviewBox extends React.Component {

    constructor(props: any) {
        super(props);
        eventManager.subscribe(RoomEventNames.roomUpdated, this.onRoomUpdated.bind(this))
    }

    onRoomUpdated(): void {
        this.setState({});
    }

    render(): ReactNode {
        return (
            <div className="room-overview-box">
                <div className="room-overview-box--room-data">
                    {roomManager.getRoomName()}
                </div>

                <div className="room-overview-box--member-list">
                    {roomManager.getRoomMembers().map(this.renderMember)}
                </div>
            </div>
        );
    }

    renderMember(member: User) {
        return (
            <div className="member-list-row" key={member.getId()}>
                <ProfileImage picture={member.getPicture()}
                              username={member.getUsername()}
                              id={member.getId()}/>
                {member.getUsername()}
                {(member.getId() === profileManager.getId() ? <span>&nbsp;(You)</span> : null)}
                {(member.isRoomMaster() ? <span className="signature-text">&nbsp;A</span> : null)}
            </div>
        );
    }

}