import React from "react";
import roomManager from "../../util/RoomManager";
import moduleRegistry from "../../modules/ModuleRegistry";

export default class GameRoom extends React.Component {


    render() {
        let currentGameId = roomManager.getCurrentGameId();
        let currentGameModule = moduleRegistry.getModuleById(currentGameId);

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