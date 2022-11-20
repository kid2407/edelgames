import React from "react";

export default class AbstractComponent extends React.Component {

    public componentIsMounted: boolean = false;

    componentDidMount() {
        this.componentIsMounted = true;
    }

    triggerRerender() {
        if(this.componentIsMounted) {
            this.setState({});
        }
    }


}