import React, {ReactNode} from "react";
import ProfileImage from "../ProfileImage/ProfileImage";
import roomManager, {RoomEventNames} from "../../util/RoomManager";
import User from "../../util/User";
import profileManager from "../../util/ProfileManager";
import eventManager from "../../util/EventManager";

interface IProps {
    renderMemberFunction?: {(member: User): JSX.Element}
}

export default class PlayerList extends React.Component<IProps, {}> {

    roomUpdatedHandler: {(): void};

    constructor(props: any) {
        super(props);
        this.roomUpdatedHandler = this.onRoomUpdated.bind(this);
    }

    componentDidMount() {
        eventManager.subscribe(RoomEventNames.roomUpdated, this.roomUpdatedHandler);
    }

    componentWillUnmount() {
        eventManager.unsubscribe(RoomEventNames.roomUpdated, this.roomUpdatedHandler);
    }

    onRoomUpdated(): void {
        this.setState({});
    }

    render(): ReactNode {
        return (
            <div id="memberList">
                {roomManager.getRoomMembers().map(this.props.renderMemberFunction || this.renderMember.bind(this))}
            </div>
        );
    }

    renderMember(member: User): JSX.Element {
        return (
            <div className="member-list-row" key={member.getId()}>
                <ProfileImage picture={member.getPicture()}
                              username={member.getUsername()}
                              id={member.getId()}/>
                {this.renderMemberData(member)}
            </div>
        );
    }

    renderMemberData(member: User): JSX.Element {
        let isLocaleUser = member.getId() === profileManager.getId();

        return (
            <div className="member-data">
                <span className="member-name">{member.getUsername()}</span>
                {(isLocaleUser ? <span>&nbsp;(You)</span> : null)}
                {(member.isRoomMaster() ? <span className="signature-text">&nbsp;A</span> : null)}
            </div>
        );
    }

}