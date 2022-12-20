import React from "react";
import roomManager from "../../util/RoomManager";
import User from "../../util/User";
import ProfileImage from "../../components/ProfileImage/ProfileImage";
import profileManager from "../../util/ProfileManager";
import moduleRegistry from "../../modules/ModuleRegistry";

export default class GameRoom extends React.Component {

    renderMember(member: User) {
        return (
            <div className="member-list-row" key={member.getId()}>
                <ProfileImage picture={member.getPicture()}
                              username={member.getUsername()}
                              id={member.getId()}/>
                <div className="memberDataDiv">
                    <span className="memberName">{member.getUsername()}</span>
                    {(member.getId() === profileManager.getId() ? <span>&nbsp;(You)</span> : null)}
                    {(member.isRoomMaster() ? <span className="signature-text">&nbsp;A</span> : null)}
                </div>
                <br/>
            </div>
        );
    }

    render() {
        let currentGameId = roomManager.getCurrentGameId();
        let currentGameModule = moduleRegistry.getModuleById(currentGameId);

        if (!currentGameModule) {
            return (
                <div id="screenGame">
                    404 - Game not found
                </div>
            );
        }

        return (
            <div id="screenGame">
                <div id="memberList">{roomManager.getRoomMembers().map(this.renderMember)}</div>
                {currentGameModule.renderGame()}
            </div>
        );
    }

}