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

type authRequestCallbackFunction = (success: boolean, authData: null|authDataContainer) => void;

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

        let formData = querystring.stringify(form).replace('%20','+');
        let contentLength = formData.length;

        // todo: this does not work, as we get back an error every time!
        // next step: check if validation is possible with another manual request (postman, insomnia, etc.)

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
    public static onAuthResponse(callback: authRequestCallbackFunction, cookie: string|null, result: IncomingMessage): void {
            /*
                'set-cookie': [
                    'xf_session=0123456789abcdef; path=/; secure; HttpOnly'
                ],
            */

        if(result.statusCode !== 200) {
            callback(false, null);
            return;
        }

        if(!cookie) {
            let cookieList = result.headers["set-cookie"];
            let cookieString = cookieList.find(cooString => cooString.indexOf('xf_session=') !== -1);
            if(!cookieString) {
                callback(false, null);
                return;
            }

            let cookieMatch = cookieString.match(/xf_session=([a-z,0-9]*);/);
            if(!cookieMatch || !cookieMatch[1]) {
                callback(false, null);
                return;
            }
            cookie = cookieMatch[1];
        }


        result.setEncoding('utf8');
        result.on('data', XenforoApi.onAuthResponseBody.bind(null, callback, cookie));
    }

    /**
     * @internal
     * @param callback
     * @param cookie
     * @param html
     */
    public static onAuthResponseBody(callback: authRequestCallbackFunction, cookie: string, html: string): void {

        const dom = new jsdom.JSDOM(html);
        let accountPopup = dom.window.document.getElementsByClassName('accountPopup')[0] as HTMLDivElement;
        if(!accountPopup) {
            callback(false, null);
            return;
        }

        let avatarUrl = (accountPopup.querySelector('.avatar img') as HTMLImageElement).src;
        let username = (accountPopup.querySelector('.accountUsername') as HTMLDivElement).innerText;

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
                'Cookie': 'xf_session='+sessionId
            },
            method: "GET"
        }, XenforoApi.onAuthResponse.bind(null, callback, sessionId));
        req.end();
    }


}