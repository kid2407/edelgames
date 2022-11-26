import {EventNameListObj} from "./EventManager";
import EventManager from "./EventManager";
import Cookies from "universal-cookie";
import SocketManager from "./SocketManager";
import debug from "./debug";

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
    pictureUrl: string|null;
    verified: boolean;
    authSessionId: string|null;
}

export class ProfileManagerSingleton {

    private id: string = "0";
    private username: string = 'loading';
    private verified: boolean = false;
    private picture: string|null = null;
    private authSessionId: string|null = null;

    constructor() {
        EventManager.subscribe(ProfileEventNames.profileChangedEventNotified, this.onProfileChangedEventNotified.bind(this))
    }

    onProfileChangedEventNotified(data: ServerProfileObject): void {
        // try automatic login, if the user has no session set
        const cookies = new Cookies();
        let authSessionCookie = cookies.get('authSession');
        if(this.authSessionId === null && data.authSessionId === null && authSessionCookie) {
            ProfileManagerSingleton.attemptAuthentication(true, '', authSessionCookie);
        }

        if(this.authSessionId !== data.authSessionId) {
            cookies.set('authSession', data.authSessionId, { path: '/' });
        }

        this.id = data.id;
        this.username = data.username;
        this.verified = data.verified;
        this.picture = data.pictureUrl;
        this.authSessionId = data.authSessionId;

        EventManager.publish(ProfileEventNames.profileUpdated);
    }

    public getUsername():    string      {return this.username; }
    public getId():          string      {return this.id;       }
    public getPicture():     string|null {return this.picture;  }
    public isVerified():     boolean     {return this.verified; }


    public static attemptAuthentication(isAuthSession: boolean, username: string, password: string) {
        SocketManager.sendEvent('userLoginAttempt', {
            isAuthSessionId: isAuthSession,
            username: username,
            password: password
        })
        debug(`Try Login as ${username} with "${password}" (use authSessionId: ${isAuthSession?'true':'false'})`);
    }

}

const ProfileManager = new ProfileManagerSingleton();
export default ProfileManager;