import {Component} from "react";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";

export default class ExampleChatGame extends Component implements ModuleGameInterface {

    render() {
        return (
            <div>
                hello example chat
            </div>
        );
    }

}