import React from "react";
import RoomListBox from "../components/RoomListBox";


export default class Lobby extends React.Component {

    render() {
        return (
            <div id="screen">
                <h1>Welcome to the lobby</h1>

                <RoomListBox />
            </div>
        );
    }

}