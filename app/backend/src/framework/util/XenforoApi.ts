import * as querystring from "querystring";
import * as https from "https";
import {IncomingMessage} from "http";
import debug from "./debug";


export type authDataContainer = {
    authCookie: string,
    username: string,
    profileImageUrl: string,
    user_id: number,
    group_id: number,
    custom_title: string
}

type loginResponse = {
    login_successful: boolean,
    xenforo_token?: string,
    minecraft_name?: string,
    user_id?: number,
    group_id?: number,
    custom_title?: string,
    gravatar?: string
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
     * When the request headers have been returned, collect the response text and pass it on
     *
     * @param callback
     * @param result
     */
    private static onAuthResponse(callback: authRequestCallbackFunction, result: IncomingMessage): void {
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
     * Parse the server response after login
     *
     * @param callback
     * @param responseText
     */
    private static onAuthResponseBody(callback: authRequestCallbackFunction, responseText: string): void {
        debug(0, "Got response from server with data:", responseText)

        try {
            let jsonResponse: loginResponse = JSON.parse(responseText)
            console.log(jsonResponse.login_successful)

            if (!jsonResponse.login_successful) {
                callback(false, null)
                return
            }

            let profileImage
            if (jsonResponse.gravatar) {
                profileImage = `https://minotar.net/helm/${jsonResponse.minecraft_name}/128.png`
            } else {
                profileImage = `https://edelmaenner.net/data/avatars/m/${Math.floor(jsonResponse.user_id / 1000)}/${jsonResponse.user_id}.jpg`
            }

            callback(true, {
                authCookie: jsonResponse.xenforo_token,
                profileImageUrl: profileImage,
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