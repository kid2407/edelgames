import React from 'react';
import SocketManager from "./util/SocketManager";
import Login from "./screens/Login";


export default class Core extends React.Component {

    socketManager : SocketManager;

    constructor(props: object) {
        super(props);
        this.socketManager = SocketManager.getInstance();
    }

    render() {
        return (
            <div className="App">
                {
                    !this.socketManager.isConnected() ?
                        <Login /> :
                        <h1>hellowrld</h1>
                }
            </div>
        );
    }
}
