import React from 'react';
import logo_em from '../../media/images/logo_em.png';

export default class Login extends React.Component {

    render() {
        return (
            <div id="login-screen">
                <div className="frame">
                    <img src={logo_em} alt={"Edelmänner Logo"}/>

                    <input type="text" placeholder="Benutzername" data-form={"login-form"} />
                    <input type="password" placeholder="Passwort" data-form={"login-form"} />

                    <button>Login</button>
                </div>
            </div>
        );
    }
}
