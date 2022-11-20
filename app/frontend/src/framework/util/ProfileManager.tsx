import EventManagerSingleton, {EventNameListObj} from "./EventManager";

export const ProfileEventNames: EventNameListObj = {
    profileChangedEventNotified: "profileChangedEventNotified",
    profileUpdated: "profileUpdated"
}

type ServerProfileObject = {
    id: string;
    username: string;
    room: string;
    screen: string;
    pictureUrl: string|null;
    verified: boolean;
}

class ProfileManager {

    id: string|null = null;
    username: string = 'loading';
    verified: boolean = false;
    picture: string|null = null;
    room: string = 'lobby';

    constructor() {
        EventManagerSingleton.subscribe(ProfileEventNames.profileChangedEventNotified, this.onProfileChangedChannelNotified.bind(this))
    }

    onProfileChangedChannelNotified(data: ServerProfileObject): void {
        this.id = data.id;
        this.username = data.username;
        this.verified = data.verified;
        this.picture = data.pictureUrl;
        this.room = data.room;

        EventManagerSingleton.publish(ProfileEventNames.profileUpdated);
    }

}

export default class ProfileManagerSingleton {

    private static instance: ProfileManager|null;

    private static getInstance(): ProfileManager  {
        if(!ProfileManagerSingleton.instance) {
            ProfileManagerSingleton.instance = new ProfileManager();
        }
        return ProfileManagerSingleton.instance;
    }

    public static initiate() {
        ProfileManagerSingleton.getInstance();
    }

    public static getUsername():    string      {return ProfileManagerSingleton.getInstance().username; }
    public static getId():          string|null {return ProfileManagerSingleton.getInstance().id; }
    public static getPicture():     string|null {return ProfileManagerSingleton.getInstance().picture; }
    public static getRoom():        string      {return ProfileManagerSingleton.getInstance().room; }
}