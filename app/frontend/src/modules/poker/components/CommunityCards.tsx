import React, { Component, ReactNode } from "react";
import { CommunityCardData } from "../PokerTypes";
import PokerCardImage from "./PokerCardImage";

export default class CommunityCards extends Component<CommunityCardData, {}> {

  render(): ReactNode {
    return <div id={"communityCards"}>
      {Array.from({ length: 5 }, (_, k) => <PokerCardImage card={this.props.cards?.[k]} />)}
    </div>;
  }

}