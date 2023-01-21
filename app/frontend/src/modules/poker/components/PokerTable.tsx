import React, { Component, ReactNode } from "react";
import { PokerTableData } from "../PokerTypes";
import PokerTablePosition from "./PokerTablePosition";
import CommunityCards from "./CommunityCards";

export default class PokerTable extends Component<PokerTableData, {}> {

  private renderPosition(position: number): ReactNode {
    return <PokerTablePosition api={this.props.api} players={this.props.players} position={position} handCards={this.props.handCards} />;
  }

  private renderPositions(): ReactNode {
    return Array.from({ length: 8 }, (v, k) => this.renderPosition(k));
  }

  render(): ReactNode {
    return <div className={"pokerTable"}>
      {this.props.isRunning ? this.renderPositions() : null}
      {this.props.isRunning ? <CommunityCards phase={this.props.phase} cards={this.props.communityCards} /> : null}
    </div>;
  }

}