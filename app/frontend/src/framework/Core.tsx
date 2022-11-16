import React from 'react';
import SessionManager from "./util/SessionManager";
import Login from "./screens/Login";

export default class Core extends React.Component {

    sessionManager : SessionManager;

    constructor(props: object) {
        super(props);
        this.sessionManager = SessionManager.getInstance();
    }

    render() {
        return (
            <div className="App">
                {
                    !this.sessionManager.isConnected() ?
                        <Login /> :
                        <h1>hellowrld</h1>
                }
            </div>
        );
    }
}
