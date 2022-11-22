import {ProfileEventNames} from "../util/ProfileManager";
import AbstractComponent from "./AbstractComponent";
import ProfileImage from "./ProfileImage";
import EventManager from "../util/EventManager";
import ProfileManager from "../util/ProfileManager";
import RoomManager from "../util/RoomManager";

export default class PageHeader extends AbstractComponent {

    constructor(props: object) {
        super(props);
        EventManager.subscribe(ProfileEventNames.profileUpdated, this.onProfileDataChanged.bind(this));
    }

    onProfileDataChanged() {
        this.triggerRerender();
    }

    render() {
        return (
            <div id="pageHeader">

                <div className="text-align-left">
                    <ProfileImage picture={ProfileManager.getPicture()}
                                  username={ProfileManager.getUsername()}
                                  id={ProfileManager.getId()}
                    />

                    <div className="profile-name">{ProfileManager.getUsername()}</div>
                </div>

                <div className="text-align-center">
                    Room: {RoomManager.getRoomName()}
                </div>

                <div className="text-align-right">

                </div>
            </div>
        );
    }

}