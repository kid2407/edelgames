import React from "react";
import EventManager from "../../util/EventManager";

export type bubbleMessage = {
  type: 'error'|'info'|'success'|'warning',
  message: string
};

interface IState {
    bubbles: bubbleMessage[]
}

export default class NotificationBubble extends React.Component<{},IState> {

    constructor(props: any) {
        super(props);

        this.state = {
            bubbles: []
        };

        // event listener for react internal events
        EventManager.subscribe('showNotificationBubble', this.addBubble.bind(this));
        // event listener for server events
        EventManager.subscribe('showNotificationBubbleEventNotified', this.addBubble.bind(this));
    }

    addBubble(data: bubbleMessage) {
        let bubbles = this.state.bubbles;
            bubbles.push(data);
        this.setState({
            bubbles: bubbles
        });

        setTimeout(this.removeBubble.bind(this,data), 3000);
    }

    removeBubble(data: bubbleMessage) {
        let bubbles = this.state.bubbles;
            bubbles = bubbles.filter(el => el !== data);
        this.setState({
            bubbles: bubbles
        });
    }

    renderBubble(data: bubbleMessage) {
        return(
            <div className={"bubble-notification bubble-"+data.type}>
                <span>{data.message}</span>
            </div>
        );
    }

    render() {
        return(
            <div id={"bubbleNotificationContainer"}>
                {this.state.bubbles.map(this.renderBubble.bind(this))}
            </div>
        );
    }

}