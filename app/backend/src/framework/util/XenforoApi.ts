import * as querystring from "querystring";
import * as https from "https";
import {IncomingMessage} from "http";


export type authDataContainer = {
    authCookie: string,
    username: string,
    profileImageUrl: string,
    user_id: number,
    group_id: number,
    custom_title: string
}

type loginResponse = {
    login_sucessful: boolean,
    xenforo_token?: string,
    minecraft_name?: string,
    user_id?: number,
    group_id?: number,
    custom_title?: string
}

type authRequestCallbackFunction = (success: boolean, authData: null | authDataContainer) => void;

const edelmaennerHost = 'edelmaenner.net';
const edelmaennerLoginPath = '/edelgames/authenticate';

export default class XenforoApi {


    /**
     * Send an authentication request to the server, using either username + password or the xenforo token.
     *
     * @param username
     * @param password
     * @param session_token
     * @param callback
     */
    private static sendAuthRequest(username: string | null, password: string | null, session_token: string | null, callback: authRequestCallbackFunction): void {
        let form = {
            login: username,
            password: password,
            xenforo_token: session_token
        };

        let formData = querystring.stringify(form).replace('%20', '+');
        let contentLength = formData.length;

        let req = https.request({
            host: edelmaennerHost,
            path: edelmaennerLoginPath,
            headers: {
                'Content-Length': contentLength,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            method: "POST"
        }, XenforoApi.onAuthResponse.bind(null, callback));

        req.write(formData);
        req.end();
    }

    /**
     * @internal
     * @param callback
     * @param result
     */
    private static onAuthResponse(callback: authRequestCallbackFunction, result: IncomingMessage): void {
        // debug(0, result.statusCode)

        if (result.statusCode !== 200) {
            callback(false, null);
            return;
        }

        result.setEncoding("utf8");

        let responseText = ''
        result.on('data', chunk => {
            responseText += chunk;
        });
        result.on('end', () => {
            XenforoApi.onAuthResponseBody(callback, responseText)
        });
    }

    /**
     * @internal
     * @param callback
     * @param responseText
     */
    private static onAuthResponseBody(callback: authRequestCallbackFunction, responseText: string): void {
        // debug(0, "Got response from server with data:", responseText)

        try {
            let jsonResponse: loginResponse = JSON.parse(responseText)
            console.log(jsonResponse.login_sucessful)

            if (!jsonResponse.login_sucessful) {
                callback(false, null)
                return
            }

            callback(true, {
                authCookie: jsonResponse.xenforo_token,
                profileImageUrl: "https://picsum.photos/256/256", //TODO replace with actual image path
                username: jsonResponse.minecraft_name,
                custom_title: jsonResponse.custom_title,
                user_id: jsonResponse.user_id,
                group_id: jsonResponse.group_id,
            });
        } catch (e) {
            // No valid JSON, most likely a server error, try again later.
            callback(false, null)
        }
    }

    /**
     *
     * Perform a login with the Xenforo session token
     *
     * @param sessionId
     * @param callback
     */
    public static loginWithToken(sessionId: string, callback: authRequestCallbackFunction): void {
        XenforoApi.sendAuthRequest(null, null, sessionId, callback)
    }


    /**
     *
     * Perform a login with a username + password
     *
     * @param username
     * @param password
     * @param callback
     */
    public static loginWithPassword(username: string, password: string, callback: authRequestCallbackFunction): void {
        XenforoApi.sendAuthRequest(username, password, null, callback)
    }

}