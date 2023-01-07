import {Component} from "react";

interface IProps {
    onSelect: ((word: string) => void),
    options: string[]
}

export default class WordSelection extends Component<IProps, {}> {

    render() {
        return (
            <div className={"word-selection"}>

                {this.props.options.map((word) => {
                    return (

                        <div className={"word-option"}
                             onClick={() => this.props.onSelect(word)}
                        >{word}</div>

                    );
                })}

            </div>
        );
    }

}