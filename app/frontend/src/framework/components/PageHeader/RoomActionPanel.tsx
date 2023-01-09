import profileManager from "../../util/ProfileManager";
import socketManager from "../../util/SocketManager";
import roomManager, {RoomEventNames} from "../../util/RoomManager";
import React, {ReactNode} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {IconName} from "@fortawesome/pro-duotone-svg-icons";

type IProps = {
    panelRemoteCloseCallback: {(): void}
}

type IState = {
    editRoomNameActive: boolean,
    editRoomPassActive: boolean,
    editedRoomName: string,
    editedPassword: string,
}

export default class RoomActionPanel extends React.Component<IProps, IState> {

    state = {
        editRoomNameActive: false,
        editRoomPassActive: false,
        editedRoomName: roomManager.getRoomName(),
        editedPassword: roomManager.getRoomPassword() || '',
    };

    passwordInputRef = React.createRef<HTMLInputElement>();
    roomNameInputRef = React.createRef<HTMLInputElement>();


    componentDidMount() {
        this.setState({
            editedPassword: roomManager.getRoomPassword() || '',
            editedRoomName: roomManager.getRoomName()
        });
    }

    leaveRoom(): void {
        socketManager.sendEvent(RoomEventNames.returnToLobby, {});
        this.props.panelRemoteCloseCallback();
    }

    returnToGameSelection(): void {
        socketManager.sendEvent(RoomEventNames.returnToGameSelection, {});
        this.props.panelRemoteCloseCallback();
    }

    toggleRoomNameEdit(): void {
        let roomName = roomManager.getRoomName();
        if(this.state.editRoomNameActive) {
            roomName = this.roomNameInputRef?.current?.value || roomName;
            roomManager.setRoomName(roomName);
            socketManager.sendEvent(RoomEventNames.changeRoomName, {newRoomName: roomName});
        }

        this.setState({
            editRoomNameActive: !this.state.editRoomNameActive,
            editedRoomName: roomName
        });
    }

    toggleRoomPasswordEdit(): void {
        let password = roomManager.getRoomPassword() || '';
        if(this.state.editRoomPassActive) {
            password = this.passwordInputRef?.current?.value || password;
            roomManager.setRoomPassword(password);
            socketManager.sendEvent(RoomEventNames.changeRoomPass, {newPassword: password});
        }

        this.setState({
            editRoomPassActive: !this.state.editRoomPassActive,
            editedPassword: password
        });
    }

    renderRoomAdminActions(): JSX.Element {
        let passwordIcon: IconName = !this.state.editedPassword ? 'unlock' : 'lock';

        return (
            <div className={"room-admin-actions"}>
                <div className={"room-edit-name"}>
                    <span>Raum-Name:</span>
                    {this.state.editRoomNameActive ?
                        <input value={this.state.editedRoomName}
                               onChange={(event) => this.setState({editedRoomName: event.target.value})}
                               ref={this.roomNameInputRef}
                               type={"text"}/> :
                        <span className={"password-inactive"}>{roomManager.getRoomName()}</span>
                    }
                    {/* edit room name */}
                    <FontAwesomeIcon onClick={this.toggleRoomNameEdit.bind(this)}
                                     icon={['fad', this.state.editRoomNameActive ? 'floppy-disk' : 'pen-to-square']} size="1x" />
                </div>

                <div className={"room-edit-password"}>
                    <span>Passwort:&nbsp;</span>
                    {this.state.editRoomPassActive ?
                        <input value={this.state.editedPassword}
                               onChange={(event) => this.setState({editedPassword: event.target.value})}
                               ref={this.passwordInputRef}
                               type={"password"}/> :
                        <span className={"password-inactive"}>{this.state.editedPassword.replace(/./g, '•')}</span>
                    }

                    {/* edit room password */}
                    <FontAwesomeIcon onClick={this.toggleRoomPasswordEdit.bind(this)}
                                     icon={['fad', this.state.editRoomPassActive ? 'floppy-disk' : passwordIcon]} size="1x" />
                </div>

            </div>
        );
    }

    render(): ReactNode {
        return (
            <div className={"room-actions-panel"}>

                {profileManager.isRoomMaster() ? this.renderRoomAdminActions() : null}

                <div className={"room-actions-move"}>
                    {/* leave room */}
                    <button onClick={this.leaveRoom.bind(this)}>
                        Raum verlassen <FontAwesomeIcon icon={['fad', 'arrow-right-from-bracket']} size="1x" />
                    </button>

                    {/* return to game selection */}
                    {profileManager.isRoomMaster() && roomManager.getCurrentGameId() ?
                        <button onClick={this.returnToGameSelection.bind(this)}>
                            Zur Spiele-Auswahl <FontAwesomeIcon icon={['fad', 'puzzle']} size="1x" />
                        </button>
                        : null
                    }

                </div>
            </div>
        );
    }

}