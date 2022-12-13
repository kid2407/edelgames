import React, {ReactNode} from "react";
import ModuleInterface from "../../modules/ModuleInterface";
import roomManager from "../../util/RoomManager";
import profileManager from "../../util/ProfileManager";
import socketManager from "../../util/SocketManager";
import moduleRegistry from "../../modules/ModuleRegistry";


export const GameSelectionEvents = {
    startGame: 'startGame'
}

export default class GameSelection extends React.Component {

    onSelectGame(gameId: string): void {
        let roomMaster = roomManager.getRoomMaster();
        if (roomMaster && roomMaster.getId() === profileManager.getId()) {
            // only the administrator should be able to select a game
            socketManager.sendEvent(GameSelectionEvents.startGame, {gameId: gameId});
        }
    }

    render(): ReactNode {
        let gameList = moduleRegistry.getModuleList();

        return (
            <div id="gameSelection" className={"no-scrollbar"}>
                {gameList.map(this.renderGameIcon.bind(this))}
            </div>
        );
    }

    renderGameIcon(module: ModuleInterface): ReactNode {
        return (
            <div className={"game-preview"}
                 key={module.getUniqueId()}
                 onClick={this.onSelectGame.bind(this, module.getUniqueId())}>

                <img src={module.getPreviewImage()}
                     alt={module.getTitle()}/>

                <div className={"preview-hover"}>
                    {module.getTitle()}
                </div>

            </div>
        );
    }


}