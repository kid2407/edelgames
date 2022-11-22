import {EventNameListObj} from "./EventManager";
import EventManager from "./EventManager";

/**
 * Stores and manages all data concerning the users own profile
 */

export const ProfileEventNames: EventNameListObj = {
    profileChangedEventNotified: "profileChangedEventNotified",
    profileUpdated: "profileUpdated"
}

type ServerProfileObject = {
    id: string;
    username: string;
    screen: string;
    pictureUrl: string|null;
    verified: boolean;
}

export class ProfileManagerSingleton {

    id: string = "0";
    username: string = 'loading';
    verified: boolean = false;
    picture: string|null = null;
    screen: string = 'lobby';

    constructor() {
        EventManager.subscribe(ProfileEventNames.profileChangedEventNotified, this.onProfileChangedEventNotified.bind(this))
    }

    onProfileChangedEventNotified(data: ServerProfileObject): void {
        this.id = data.id;
        this.username = data.username;
        this.verified = data.verified;
        this.picture = data.pictureUrl;
        this.screen = data.screen;

        EventManager.publish(ProfileEventNames.profileUpdated);
    }

    public getUsername():    string      {return this.username; }
    public getId():          string      {return this.id; }
    public getPicture():     string|null {return this.picture; }
    public getScreen():        string      {return this.screen; }

}

const ProfileManager = new ProfileManagerSingleton();
export default ProfileManager;