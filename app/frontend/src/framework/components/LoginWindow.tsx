import logo_em from '../../media/images/logo_em.png';
import React, {MouseEventHandler} from "react";
import {ProfileManagerSingleton} from "../util/ProfileManager";

type LoginWindowProps = {
    show: boolean,
    closeFunction: MouseEventHandler
}

export default class LoginWindow extends React.Component<LoginWindowProps, {}> {

    tryLogin() {
        // username: HTMLInputElement
        let loginScreen = document.getElementById('login-backdrop') as HTMLElement,
            username = (loginScreen.querySelector('input[type=text]') as HTMLInputElement)?.value,
            password = (loginScreen.querySelector('input[type=password]') as HTMLInputElement)?.value;

        if(!username || !password) {
            let errorMessage = loginScreen.querySelector('.error-message') as HTMLInputElement;
            errorMessage.innerText = "Benutzername oder Password ungültig!";
            return;
        }

        ProfileManagerSingleton.attemptAuthentication(false, username, password);
    }

    render() {
        if(!this.props.show) {
            return null;
        }

        return (
            <div id="login-backdrop"
                 onClick={this.props.closeFunction}>

                <div className="frame"
                     onClick={(event) => event.stopPropagation() }>

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
