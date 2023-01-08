import React from "react";
import GameSelection from "../../components/GameSelection/GameSelection";
import PlayerList from "../../components/PlayerList/PlayerList";

export default class IdleRoom extends React.Component {

    render() {
        return (
            <div id="screenIdleRoom">
                <div className={"idle-room-overview"}>
                    <PlayerList />
                </div>

                <div className={"idle-game-selection"}>
                    <GameSelection/>
                </div>

            </div>
        );
    }

}