import React, {Component, createRef, RefObject} from "react";
import RoomManager from "../../../framework/util/RoomManager";

export type DAGChatMessage = {
    sender: string,
    text: string,
    timestamp: number,
    coloring: string|null
}

interface IProps {
    onSendCallback: (message: string) => void,
    messageHistory: DAGChatMessage[],
    isGuessing: boolean
}

export default class ChatBox extends Component<IProps,{}> {

    playerNames: {[key: string]: string} = {};
    inputField: RefObject<HTMLInputElement> = createRef();

    constructor(props: IProps | Readonly<IProps>) {
        super(props);
        RoomManager.getRoomMembers().forEach(member => this.playerNames[member.getId()] = member.getUsername());
    }

    onKeyPressed(event: React.KeyboardEvent<HTMLInputElement>): void {
        if(this.inputField.current && event.key === 'Enter') {
            let value = this.inputField.current.value;

            if(value) {
                this.inputField.current.value = '';
                this.props.onSendCallback(value);
            }
        }
    }

    renderChatMessage(message: DAGChatMessage): JSX.Element {
        let sender = (message.sender === 'system') ? null : (this.playerNames[message.sender] || '???');

        let classNames = "chat-box-message";
        if(message.coloring) {
            classNames += " message-coloring-"+message.coloring;
        }

        return (
            <div className={classNames}
                key={message.timestamp}>
                <span>{sender ? `${sender}: ` : ''}{message.text}</span>
            </div>
        );
    }

    render() {
        return(
            <div className={"chat-box"}>
                <div className={"chat-box-history"}>
                    {this.props.messageHistory.map(this.renderChatMessage.bind(this))}
                </div>
                <div className={"chat-box-input"}>
                    <input ref={this.inputField}
                           type={"text"}
                           placeholder={'Dein Lösungswort...'}
                           disabled={!this.props.isGuessing}
                           onKeyDown={this.onKeyPressed.bind(this)}/>
                </div>
            </div>
        );
    }
}