import React from "react";
import RoomManager from "../../util/RoomManager";
import ModuleRegistry from "../../modules/ModuleRegistry";
import User from "../../util/User";
import ProfileImage from "../../components/ProfileImage/ProfileImage";
import ProfileManager from "../../util/ProfileManager";

export default class GameRoom extends React.Component {

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
        let currentGameId = RoomManager.getCurrentGameId();
        let currentGameModule = ModuleRegistry.getModuleById(currentGameId);

        if(!currentGameModule) {
            return (
                <div id="screenGame">
                    404 - Game not found
                </div>
            );
        }

        return (
            <div id="screenGame">
                <div id="memberList">{RoomManager.getRoomMembers().map(this.renderMember)}</div>
                {currentGameModule.renderGame()}
            </div>
        );
    }

}