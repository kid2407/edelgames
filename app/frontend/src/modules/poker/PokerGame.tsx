import React, {ReactNode} from "react";
import ModuleGameInterface from "../../framework/modules/ModuleGameInterface";
import ModuleApi from "../../framework/modules/ModuleApi";
import poker from "./Poker";

export default class PokerGame extends React.Component<{}, {}> implements ModuleGameInterface {

    private readonly api: ModuleApi;
    private initialized: boolean = false;

    constructor(props: any) {
        super(props);
        this.api = new ModuleApi(poker, this);
    }

    // this method is called, once the component is ready and setState can be used
    componentDidMount(): void {
        if (!this.initialized) {
            // Register event listeners and/or prepared things you need when the view is ready to render via this.gameApi.addEventHandler()
            this.initialized = true;
        }
    }

    render(): ReactNode {
        return (
            <div id={"poker"}>
                <p>Add your content in here</p>
            </div>
        );
    }
}