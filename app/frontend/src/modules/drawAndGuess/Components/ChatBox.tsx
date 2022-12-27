import React, {Component, createRef, RefObject} from "react";
import RoomManager from "../../../framework/util/RoomManager";

export type DAGChatMessage = {
    sender: string,
    text: string,
    timestamp: number,
    color: string|null
}

interface IProps {
    onSendCallback: (message: string) => void,
    messageHistory: DAGChatMessage[];
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
        let sender = (message.sender === 'system') ? '' : (this.playerNames[message.sender] || '???') + ':';

        return (
            <div className={"chat-box-message"}
                key={message.timestamp} style={{
                color: message.color ?? 'inherit'
            }}>
                <span>{sender}&nbsp;</span>
                <span>{message.text}</span>
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
                    <input ref={this.inputField} type={"text"} placeholder={'...'} onKeyDown={this.onKeyPressed.bind(this)}/>
                </div>
            </div>
        );
    }
}