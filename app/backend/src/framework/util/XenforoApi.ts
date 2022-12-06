import * as querystring from "querystring";
import * as https from "https";
import {IncomingMessage} from "http";
import jsdom from "jsdom";
import debug from "./debug";


export type authDataContainer = {
    authCookie: string,
    username: string,
    profileImageUrl: string
}

type authRequestCallbackFunction = (success: boolean, authData: null | authDataContainer) => void;

const edelmaennerHost = 'edelmaenner.net';
const edelmaennerLoginPath = '/login/login';
const edelmaennerAccountPath = '/account';

export default class XenforoApi {


    public static sendAuthRequest(username: string, password: string, callback: authRequestCallbackFunction): void {

        let form = {
            login: username,
            password: password,
            redirect: edelmaennerAccountPath,
            register: "0",
            cookie_check: 0
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
        }, XenforoApi.onAuthResponse.bind(null, callback, null));

        req.write(formData);
        req.end();
    }

    /**
     * @internal
     * @param callback
     * @param cookie
     * @param result
     */
    public static onAuthResponse(callback: authRequestCallbackFunction, cookie: string | null, result: IncomingMessage): void {
        /*d
            'set-cookie': [
                'xf_session=0123456789abcdef; path=/; secure; HttpOnly'
            ],
        */

        debug(0, result.statusCode)

        if (result.statusCode !== 303 && result.statusCode !== 200) {
            callback(false, null);
            return;
        }
        // Login erfolgreich, wir haben den redirect bekommen oder haben uns via authId eingeloggt
        debug(0, "Login erfolgreich!")

        if (!cookie) {
            let cookieList = result.headers["set-cookie"];
            let cookieString = cookieList.find(cooString => cooString.indexOf('xf_session=') !== -1);
            if (!cookieString) {
                callback(false, null);
                return;
            }

            let cookieMatch = cookieString.match(/xf_session=([a-z,0-9]*);/);
            if (!cookieMatch || !cookieMatch[1]) {
                callback(false, null);
                return;
            }
            cookie = cookieMatch[1];
        }

        // Wenn das Anmelden erfolgreich war, mit dem erhaltenen Cookie Infos zum Benutzer-Account abrufen
        let req = https.request({
            host: edelmaennerHost,
            path: edelmaennerAccountPath,
            headers: {
                'Cookie': 'xf_session=' + cookie
            },
            method: "GET"
        }, res => {
            res.setEncoding("utf8");

            let responseHTML = ''
            res.on('data', chunk => {
                responseHTML += chunk;
            });
            res.on('end', () => {
                XenforoApi.onAuthResponseBody(callback, cookie, responseHTML)
            });
        });
        req.end();
    }

    /**
     * @internal
     * @param callback
     * @param cookie
     * @param html
     */
    public static onAuthResponseBody(callback: authRequestCallbackFunction, cookie: string, html: string): void {

        // debug(0, "Got response form server with data:", html)
        const dom = new jsdom.JSDOM(html);
        let accountPopup = dom.window.document.getElementsByClassName('accountPopup')[0] as HTMLDivElement;
        if (!accountPopup) {
            callback(false, null);
            return;
        }

        let avatarUrl = (accountPopup.querySelector('.avatar img') as HTMLImageElement).src;
        let username = (accountPopup.querySelector('.accountUsername') as HTMLElement).textContent;

        if(!username) {
            callback(false, null);
        }

        callback(true, {
            authCookie: cookie,
            profileImageUrl: avatarUrl,
            username: username
        });
    }

    public static sendTokenAuthRequest(sessionId: string, callback: authRequestCallbackFunction): void {
        let req = https.request({
            host: edelmaennerHost,
            path: edelmaennerAccountPath,
            headers: {
                'Cookie': 'xf_session=' + sessionId
            },
            method: "GET"
        }, XenforoApi.onAuthResponse.bind(null, callback, sessionId));
        req.end();
    }


}