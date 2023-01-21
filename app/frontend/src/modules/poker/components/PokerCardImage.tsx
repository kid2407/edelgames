import React, { Component, ReactNode } from "react";
import { PokerCard, PokerCardType } from "../PokerTypes";

export default class PokerCardImage extends Component<{ card: PokerCard | null | undefined }, {}> {

  private getNameForCard(card: PokerCard): string {
    let suit: string;
    let value: string;

    switch (card.suit) {
      case PokerCardType.CLUBS:
        suit = "Kreuz";
        break;
      case PokerCardType.DIAMONDS:
        suit = "Karo";
        break;
      case PokerCardType.HEARTS:
        suit = "Herz";
        break;
      case PokerCardType.SPADES:
        suit = "Pik";
        break;
    }

    switch (card.value) {
      case 14:
        value = "Ass";
        break;
      case 13:
        value = "König";
        break;
      case 12:
        value = "Dame";
        break;
      case 11:
        value = "Bube";
        break;
      default:
        value = String(card.value);
        break;
    }

    return `${suit} ${value}`;
  }

  render(): ReactNode {
    if (this.props.card !== null && typeof this.props.card !== "undefined") {
      return <img src={`images/poker/cards/${this.props.card.value}_of_${this.props.card.suit}.png`} alt={this.getNameForCard(this.props.card)} title={this.getNameForCard(this.props.card)} />;
    } else {
      return <img alt={""} className={"card"} src={"images/poker/card_back.png"} />;
    }
  }

}