import React from "react";
import RoomOverviewBox from "../../components/RoomOverviewBox/RoomOverviewBox";
import GameSelection from "../../components/GameSelection/GameSelection";

export default class IdleRoom extends React.Component {

    render() {
        return (
            <div id="screenIdleRoom">
                <div className={"idle-room-overview"}>
                    <RoomOverviewBox/>
                </div>

                <div className={"idle-game-selection"}>
                    <GameSelection/>
                </div>

            </div>
        );
    }

}