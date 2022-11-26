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
                    // we tell eslint to ignore this direct state mutation, as it is intended this way
                    // eslint-disable-next-line react/no-direct-mutation-state
                    this.state[attr] = data[attr];
                }
            }
        }
    }



}