import {ProfileEventNames} from "../util/ProfileManager";
import AbstractComponent from "./AbstractComponent";
import ProfileImage from "./ProfileImage";
import EventManager from "../util/EventManager";
import ProfileManager from "../util/ProfileManager";
import RoomManager from "../util/RoomManager";
import LoginWindow from "./LoginWindow";

type PageHeaderState = {
    showLoginWindow: boolean
}

export default class PageHeader extends AbstractComponent {

    state: PageHeaderState = {
        showLoginWindow: false
    };

    constructor(props: object) {
        super(props);

        EventManager.subscribe(ProfileEventNames.profileUpdated, this.onProfileDataChanged.bind(this));
    }

    onProfileDataChanged() {
        this.triggerRerender();
    }

    onOpenLoginWindow() {
        this.setState({
            showLoginWindow: true
        });
        console.log('showing login window');
    }

    onCloseLoginWindow() {
        this.setState({
            showLoginWindow: false
        });
        console.log('hiding login window');
    }

    render() {
        return (
            <div id="pageHeader">

                <div className="text-align-left">

                    <span id="userProfileInfoShort"
                          onClick={this.onOpenLoginWindow.bind(this)}>

                        <ProfileImage picture={ProfileManager.getPicture()}
                                      username={ProfileManager.getUsername()}
                                      id={ProfileManager.getId()}
                        />

                        <div className="profile-name">{ProfileManager.getUsername()}</div>
                    </span>

                </div>

                <div className="text-align-center">
                    Room: {RoomManager.getRoomName()}
                </div>

                <div className="text-align-right">

                </div>

                {
                    ProfileManager.isVerified() ? null :
                        <LoginWindow show={this.state.showLoginWindow}
                                     closeFunction={this.onCloseLoginWindow.bind(this)} />
                }
            </div>
        );
    }

}