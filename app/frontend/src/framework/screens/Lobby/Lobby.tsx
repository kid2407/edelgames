import React from "react";
import RoomListBox from "../../components/RoomListBox/RoomListBox";

export default class Lobby extends React.Component {


    render() {
        return (
            <div id="screenLobby">
                <RoomListBox/>
            </div>
        );
    }

}