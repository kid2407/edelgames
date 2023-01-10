import React from "react";
import RoomListBox from "../../components/RoomListBox/RoomListBox";
import DiceBox from "../../components/DiceBox/DiceBox";

export default class Lobby extends React.Component {

    state = {
        results: [1,1,1],
        rollIndex: 0
    }


    setNewResult(): void {
        let newResults: number[] = [...Array(3)].map(() => Math.floor(Math.random()*6)+1);
        this.setState({
            results: newResults,
            rollIndex: this.state.rollIndex + 1
        });
    }


    render() {
        return (
            <div id="screenLobby">
                <RoomListBox/>

                <div style={{margin: '1rem'}}>
                    <button onClick={this.setNewResult.bind(this)}>würfeln</button>
                    <DiceBox rollIndex={this.state.rollIndex} nextRollResults={this.state.results}/>
                </div>

            </div>
        );
    }

}