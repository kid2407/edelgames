import React from "react";

export default class AbstractComponent extends React.Component {

    public componentIsMounted: boolean = false;

    state: {[key: string]: any} = {};

    componentDidMount() {
        this.componentIsMounted = true;
    }

    triggerRerender() {
        if(this.componentIsMounted) {
            this.setState({});
        }
    }

    setStateSafe(data: {[key: string]: any}) {
        if(this.componentIsMounted) {
            this.setState(data);
        }
        else {
            for(let attr in data) {
                if(data.hasOwnProperty(attr)) {
                    this.state[attr] = data[attr];
                }
            }
        }
    }



}