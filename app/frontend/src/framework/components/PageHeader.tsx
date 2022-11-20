import ProfileManagerSingleton, {ProfileEventNames} from "../util/ProfileManager";
import AbstractComponent from "./AbstractComponent";
import EventManagerSingleton from "../util/EventManager";
import default_profile_image from "../../media/images/default_profile.png"

export default class PageHeader extends AbstractComponent {

    constructor(props: object) {
        super(props);
        EventManagerSingleton.subscribe(ProfileEventNames.profileUpdated, this.onProfileDataChanged.bind(this));
    }

    onProfileDataChanged() {
        this.triggerRerender();
    }

    render() {
        return (
            <div id="pageHeader">

                <div className="text-align-left">
                    <div className="profile-picture">
                        <img src={ProfileManagerSingleton.getPicture() ?? default_profile_image}
                             alt={ProfileManagerSingleton.getUsername()} />
                    </div>
                    <div className="profile-name">{ProfileManagerSingleton.getUsername()}</div>
                </div>

                <div className="text-align-center">

                </div>

                <div className="text-align-right">

                </div>
            </div>
        );
    }

}