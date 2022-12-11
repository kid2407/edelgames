import profileManager, {ProfileEventNames} from "../../util/ProfileManager";
import ProfileImage from "../ProfileImage/ProfileImage";
import LoginWindow from "../LoginWindow/LoginWindow";
import eventManager from "../../util/EventManager";
import socketManager from "../../util/SocketManager";
import roomManager, {RoomEventNames} from "../../util/RoomManager";
import React, {ReactNode} from "react";

type IState = {
    showLoginWindow: boolean
}

export default class PageHeader extends React.Component<{}, IState> {

    state = {
        showLoginWindow: false
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

    leaveRoom(): void {
        socketManager.sendEvent(RoomEventNames.returnToLobby, {});
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
                    Room: {roomManager.getRoomName()}
                    {
                        (roomManager.getRoomId() === 'lobby') ? null :
                            <button className="secondary" onClick={this.leaveRoom.bind(this)}>Raum verlassen</button>
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