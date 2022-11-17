import React from 'react';
import logo_em from '../../media/images/logo_em.png';
import SocketManager from "../util/SocketManager";

export default class Login extends React.Component {

    sessionManager : SocketManager;

    constructor(props: object) {
        super(props);
        this.sessionManager = SocketManager.getInstance();
    }

    tryLogin() {
        // username: HTMLInputElement
        let loginScreen = document.getElementById('login-screen'),
            username = (loginScreen?.querySelector('input[type=text]') as HTMLInputElement)?.value,
            password = (loginScreen?.querySelector('input[type=password]') as HTMLInputElement)?.value;

        if(!username || !password) {
            let errorMessage = loginScreen?.querySelector('.error-message') as HTMLInputElement;
            errorMessage.innerText = "Benutzername oder Password ungültig!";
            return;
        }


        console.log('Logging in with u: ' + username + " and p: " + password);
    }

    render() {
        return (
            <div id="login-screen">
                <div className="frame">
                    <img src={logo_em} alt={"Edelmänner Logo"}/>

                    <div className="error-message"></div>

                    <input type="text" placeholder="Benutzername" />
                    <input type="password" placeholder="Passwort" />

                    <div className="text-align-right">
                        <button onClick={this.tryLogin.bind(this)}>Login</button>
                    </div>
                </div>
            </div>
        );
    }
}
