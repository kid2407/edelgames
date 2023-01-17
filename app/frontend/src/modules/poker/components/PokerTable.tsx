import React, {Component, ReactNode} from "react";
import { PokerCard, PokerCardType, PokerTableData } from "../PokerTypes";

export default class PokerTable extends Component<PokerTableData, {}> {

    private getNameForCard(card: PokerCard): string {
        let suit: string
        let value: string

        switch (card.suit) {
            case PokerCardType.CLUBS:
                suit = "Kreuz"
                break
            case PokerCardType.DIAMONDS:
                suit = "Karo"
                break
            case PokerCardType.HEARTS:
                suit = "Herz"
                break
            case PokerCardType.SPADES:
                suit = "Pik"
                break
        }

        switch (card.value) {
            case 14:
                value = "Ass"
                break
            case 13:
                value = "König"
                break
            case 12:
                value = "Dame"
                break
            case 11:
                value = "Bube"
                break
            default:
                value = String(card.value)
                break
        }

        return `${suit} ${value}`
    }

    private renderPosition(position: number): ReactNode {
        if (position < this.props.players.length) {
            let player = this.props.api.getPlayerApi().getPlayerById(this.props.players[position])
            return <div key={"player_position_" + position} className={"playerWrapper position_" + position}>
                <div className={"handCards"}>
                    {this.props.handCards !== null && this.props.players.indexOf(this.props.api.getPlayerApi().getLocalePlayer().getId()) === position ?
                        <img alt={this.getNameForCard(this.props.handCards.firstCard)} title={this.getNameForCard(this.props.handCards.firstCard)}
                             src={`images/poker/cards/${this.props.handCards?.firstCard.value}_of_${this.props.handCards?.firstCard.suit}.png`}/> :
                        <img alt={""} src={"images/poker/card_back.png"}/>}
                    {this.props.handCards !== null && this.props.players.indexOf(this.props.api.getPlayerApi().getLocalePlayer().getId()) === position ?
                        <img alt={this.getNameForCard(this.props.handCards.secondCard)} title={this.getNameForCard(this.props.handCards.secondCard)}
                             src={`images/poker/cards/${this.props.handCards?.secondCard.value}_of_${this.props.handCards?.secondCard.suit}.png`}/> :
                        <img alt={""} src={"images/poker/card_back.png"}/>}
                </div>
                <div className={"playerData"}>
                    <span>{player?.getUsername()}</span>
                </div>
            </div>
        }

        return <div key={"player_position_" + position} className={"playerWrapper position_" + position}>
            <div className={"handCards"}>
                <img alt={""} src={"images/poker/card_back.png"}/>
                <img alt={""} src={"images/poker/card_back.png"}/>
            </div>
            <div className={"playerData"}>
                <span>Guest #{position}</span>
            </div>
        </div>
    }

    private renderPositions(): ReactNode {
        return Array.from({length: 8}, (v, k) => this.renderPosition(k))
    }

    render(): ReactNode {
        return <div className={"pokerTable"}>
            {this.props.isRunning ? this.renderPositions() : null}
        </div>;
    }

}