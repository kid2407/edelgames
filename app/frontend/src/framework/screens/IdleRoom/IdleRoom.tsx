import React from "react";
import RoomOverviewBox from "../../components/RoomOverviewBox";

export default class IdleRoom extends React.Component {

    render() {
        return (
            <div id="screen">
                <h1>Idle Room</h1>

                <RoomOverviewBox />
            </div>
        );
    }

}