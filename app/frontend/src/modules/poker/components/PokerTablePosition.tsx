import React, { Component, ReactNode } from "react";
import { PokerTablePositionData } from "../PokerTypes";
import PokerCardImage from "./PokerCardImage";

export default class PokerTablePosition extends Component<PokerTablePositionData, {}> {

  render(): ReactNode {
    if (this.props.position < this.props.players.length) {
      let player = this.props.api.getPlayerApi().getPlayerById(this.props.players[this.props.position]);
      return <div key={"player_position_" + this.props.position} className={"playerWrapper position_" + this.props.position}>
        <div className={"handCards"}>
          <PokerCardImage card={this.props.players.indexOf(this.props.api.getPlayerApi().getLocalePlayer().getId()) === this.props.position ? this.props.handCards?.firstCard : null} />
          <PokerCardImage card={this.props.players.indexOf(this.props.api.getPlayerApi().getLocalePlayer().getId()) === this.props.position ? this.props.handCards?.secondCard : null} />
        </div>
        <div className={"playerData"}>
          <span>{player?.getUsername()}</span>
          <br />
          <span>{/*TODO Mehr Daten hier anzeigen*/}</span>
        </div>
      </div>;
    }

    return <div key={"player_position_" + this.props.position} className={"playerWrapper position_" + this.props.position}>
      <div className={"handCards"}>
        <img alt={""} src={"images/poker/card_back.png"} />
        <img alt={""} src={"images/poker/card_back.png"} />
      </div>
      <div className={"playerData"}>
        <span>Guest #{this.props.position}</span>
      </div>
    </div>;
  }

}