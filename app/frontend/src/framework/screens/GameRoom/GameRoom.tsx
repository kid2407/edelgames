import React from "react";
import RoomManager from "../../util/RoomManager";
import ModuleRegistry from "../../modules/ModuleRegistry";

export default class GameRoom extends React.Component {

    render() {
        let currentGameId = RoomManager.getCurrentGameId();
        let currentGameModule = ModuleRegistry.getModuleById(currentGameId);

        if (!currentGameModule) {
            return (
                <div id="screenGame">
                    404 - Game not found
                </div>
            );
        }

        return (
            <div id="screenGame">
                {currentGameModule.renderGame()}
            </div>
        );
    }

}