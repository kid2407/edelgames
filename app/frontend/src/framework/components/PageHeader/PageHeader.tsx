import profileManager, {ProfileEventNames} from "../../util/ProfileManager";
import ProfileImage from "../ProfileImage/ProfileImage";
import LoginWindow from "../LoginWindow/LoginWindow";
import eventManager from "../../util/EventManager";
import roomManager from "../../util/RoomManager";
import React, {ReactNode} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import RoomActionPanel from "./RoomActionPanel";

type IState = {
    showLoginWindow: boolean,
    showRoomActionWindow: boolean
}

export default class PageHeader extends React.Component<{}, IState> {

    state = {
        showLoginWindow: false,
        showRoomActionWindow: false
    };

    constructor(props: object) {
        super(props);

        eventManager.subscribe(ProfileEventNames.profileUpdated, this.onProfileDataChanged.bind(this));
    }

    onProfileDataChanged(): void {
        this.setState({});
    }

    onOpenLoginWindow(): void {
        this.setState({
            showLoginWindow: true
        });
    }

    onCloseLoginWindow(): void {
        this.setState({
            showLoginWindow: false
        });
    }

    toggleRoomActionPanel(): void {
        this.setState({
            showRoomActionWindow: !this.state.showRoomActionWindow
        });
    }

    renderRoomData(): ReactNode {
        return (
            <div className={"room-data"}>

                <div className={"room-name"}>
                    {roomManager.getRoomName()}
                </div>

                <div className={"room-actions"}>
                    <FontAwesomeIcon icon={['fad', 'circle-chevron-down']} size="1x" onClick={this.toggleRoomActionPanel.bind(this)} />
                </div>

                {this.state.showRoomActionWindow ?
                    <RoomActionPanel panelRemoteCloseCallback={this.toggleRoomActionPanel.bind(this)}/>
                    : null }
            </div>
        );
    }

    render(): ReactNode {
        return (
            <div id="pageHeader">

                <div className="text-align-left">

                    <span id="userProfileInfoShort"
                          onClick={this.onOpenLoginWindow.bind(this)}>

                        <ProfileImage picture={profileManager.getPicture()}
                                      username={profileManager.getUsername()}
                                      id={profileManager.getId()}
                        />

                        <div className="profile-name">{profileManager.getUsername()}</div>
                    </span>

                </div>

                <div className="text-align-center">
                    {
                        (roomManager.getRoomId() === 'lobby') ? null : this.renderRoomData()
                    }
                </div>

                <div className="text-align-right">

                </div>

                {
                    profileManager.isVerified() ? null :
                        <LoginWindow show={this.state.showLoginWindow}
                                     closeFunction={this.onCloseLoginWindow.bind(this)}/>
                }
            </div>
        );
    }

}