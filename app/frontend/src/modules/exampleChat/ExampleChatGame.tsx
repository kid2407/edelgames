import {Component} from "react";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleGameApi from "../../framework/modules/ModuleGameApi";
import exampleChat from "./ExampleChat";

export default class ExampleChatGame extends Component implements ModuleGameInterface {

    private readonly gameApi: ModuleGameApi;
    private chatHistory: HTMLDivElement|null = null;
    private inputElement: HTMLInputElement|null = null;

    constructor(props: any) {
        super(props);
        this.gameApi = new ModuleGameApi(exampleChat, this);
    }

    onSendMessage() {
        if(!this.inputElement) return;

        // messages send by the gameApi are automatically assigned to this module and will not be interpreted by any other game
        // messages, that were send by the user get the prefix "userMessage_"
        this.gameApi.sendMessageToServer('userMessageSend', {
            message: this.inputElement.value
        });
    }

    onReceiveMessage() {

    }

    render() {
        return (
            <div>
                <div id={"exampleChat_chat_history"} ref={el => this.chatHistory = el}>
                    <div className={"chat_message"}>Start of history</div>
                </div>
                <div>
                    <input type={"text"}  ref={el => this.inputElement = el} placeholder={"Deine Nachricht"} />
                    <button onClick={this.onSendMessage.bind(this)}>Senden</button>
                </div>
            </div>
        );
    }

}