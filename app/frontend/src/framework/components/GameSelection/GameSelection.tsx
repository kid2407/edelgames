import React from "react";
import ModuleRegistry from "../../modules/ModuleRegistry";
import ModuleInterface from "../../modules/ModuleInterface";
import RoomManager from "../../util/RoomManager";
import ProfileManager from "../../util/ProfileManager";
import debug from "../../util/debug";
import SocketManager from "../../util/SocketManager";


export default class GameSelection extends React.Component {

    onSelectGame(gameId: string ) {
        let roomMaster = RoomManager.getRoomMaster();
        if(roomMaster && roomMaster.getId() === ProfileManager.getId()) {
            // only the administrator should be able to select a game
            SocketManager.sendEvent('start_game', {gameId: gameId});
        }
    }

    render() {
        let gameList = ModuleRegistry.getModuleList();

        return(
            <div id="gameSelection">
                {gameList.map(this.renderGameIcon.bind(this))}
            </div>
        );
    }

    renderGameIcon(module: ModuleInterface) {
        return (
            <div className={"game-preview"} key={module.getUniqueId()} onClick={this.onSelectGame.bind(this, module.getUniqueId())}>
                <img src={module.getPreviewImage()} alt={module.getTitle()}/>
                <div className={"preview-hover"}>
                    {module.getTitle()}
                </div>
            </div>
        );
    }


}