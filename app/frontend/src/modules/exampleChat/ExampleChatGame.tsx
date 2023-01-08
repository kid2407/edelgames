import React, {ReactNode} from "react";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import exampleChat from "./ExampleChat";
import User from "../../framework/util/User";
import profileManager from "../../framework/util/ProfileManager";
import ModuleApi from "../../framework/modules/ModuleApi";

type messageObject = {
    receivedAt: Date | null;
    senderId: string | null;
    text: string;
}

interface IState {
    chatHistory?: messageObject[];
}

export default class ExampleChatGame extends React.Component<{}, IState> implements ModuleGameInterface {

    private readonly api: ModuleApi;
    private inputElement: HTMLInputElement | null = null;
    private systemUser: User = new User('00000000', 'system', null, false);

    // state is an inherited property from React.Component
    state = {
        chatHistory: []
    }

    constructor(props: any) {
        super(props);
        this.api = new ModuleApi(exampleChat, this);
    }

    // this method is called, once the component is ready and setState can be used
    componentDidMount(): void {
        this.api.getEventApi().addEventHandler('serverMessageSend', this.onReceiveMessage.bind(this));
    }

    onSendMessage(): void {
        if (!this.inputElement || this.inputElement.value === '') return;

        // messages send by the gameApi are automatically assigned to this module and will not be interpreted by any other game
        this.api.getEventApi().sendMessageToServer('userMessageSend', {
            message: this.inputElement.value
        });
        this.inputElement.value = "";
    }

    onReceiveMessage(eventData: { [key: string]: any }): void {
        let newMessage: messageObject = {
            receivedAt: new Date(),
            senderId: eventData.user,
            text: eventData.message
        };

        let chatHistory = [...this.state.chatHistory, newMessage];

        // setState will trigger a rerender
        this.setState({
            chatHistory: chatHistory
        });
    }

    onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
        if (event.key === 'Enter') {
            this.onSendMessage();
            event.preventDefault();
            return;
        }
    }

    renderChatMessage(data: messageObject, index: number): ReactNode {
        let userData = data.senderId ? this.api.getPlayerApi().getPlayerById(data.senderId) : this.systemUser;
        let isOwnMessage = data.senderId === profileManager.getId();

        let messageClasses = 'chat-message';
        if (isOwnMessage)
            messageClasses += ' own-message';

        return (
            <div key={index} className={messageClasses}>
                <div className={"message-bubble"}>
                    <div className={"message-header"}>
                        <span>{userData?.getUsername()}&nbsp;</span>
                    </div>
                    <div>{data.text}</div>
                </div>
            </div>
        );
    }

    render(): ReactNode {
        return (
            <div id={"exampleChat"}>
                <div className={"chat-history"}>
                    {this.renderChatMessage({
                        senderId: null,
                        receivedAt: null,
                        text: 'Start of chat history'
                    }, -1)}
                    {this.state.chatHistory.map(this.renderChatMessage.bind(this))}
                </div>
                <div className={"chat-input"}>
                    <input type={"text"}
                           ref={el => this.inputElement = el}
                           placeholder={"Deine Nachricht"}
                           onKeyDown={this.onInputKeyDown.bind(this)}/>
                    <button onClick={this.onSendMessage.bind(this)}>Senden</button>
                </div>
            </div>
        );
    }

}