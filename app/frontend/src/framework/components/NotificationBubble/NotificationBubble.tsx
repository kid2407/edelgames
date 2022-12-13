import React, {ReactNode} from "react";
import eventManager, {EventDataObject} from "../../util/EventManager";

export type BubbleMessage = {
    type: 'error' | 'info' | 'success' | 'warning',
    message: string
};

interface IState {
    bubbles: BubbleMessage[]
}

export default class NotificationBubble extends React.Component<{}, IState> {

    constructor(props: any) {
        super(props);

        this.state = {
            bubbles: []
        };

        // event listener for react internal events
        eventManager.subscribe('showNotificationBubble', this.addBubble.bind(this));
        // event listener for server events
        eventManager.subscribe('showNotificationBubbleEventNotified', this.addBubble.bind(this));
    }

    addBubble(data: EventDataObject) {
        let bubbles = this.state.bubbles;
        bubbles.push(data as BubbleMessage);

        this.setState({
            bubbles: bubbles
        });

        setTimeout(this.removeBubble.bind(this, data as BubbleMessage), 3000);
    }

    removeBubble(data: EventDataObject): void {
        let bubbles = this.state.bubbles;
        bubbles = bubbles.filter(el => el !== data);
        this.setState({
            bubbles: bubbles
        });
    }

    renderBubble(data: BubbleMessage): ReactNode {
        return (
            <div className={"bubble-notification bubble-" + data.type}>
                <span>{data.message}</span>
            </div>
        );
    }

    render(): ReactNode {
        return (
            <div id={"bubbleNotificationContainer"}>
                {this.state.bubbles.map(this.renderBubble.bind(this))}
            </div>
        );
    }

}