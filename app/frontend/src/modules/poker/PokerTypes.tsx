import ModuleApi from "../../framework/modules/ModuleApi";

export type PokerConfigType = {
  startingMoney: number
  smallBlind: number
  bigBlind: number
  firstBlindRaise: number
  firstBlindFactor: number
  secondBlindRaise: number
  secondBlindFactor: number
}

export type PokerGameState = {
  config: PokerConfigType,
  communityCards: PokerCard[]
  round: number,
  running: boolean,
  handCards: PokerHandCard | null,
  phase: PokerPhase,
  players: string[]
}

export enum PokerCardType {
  CLUBS = "clubs",
  DIAMONDS = "diamonds",
  HEARTS = "hearts",
  SPADES = "spades"
}

export type PokerHandCard = {
  firstCard: PokerCard,
  secondCard: PokerCard
}

export type PokerCard = {
  suit: PokerCardType,
  value: number
}

export enum PokerPhase {
  PREFLOP,
  FLOP,
  TURN,
  RIVER,
  SHOWDOWN
}

export type PokerConfigProps = {
  api: ModuleApi,
  config: PokerConfigType,
  isRoomMaster: boolean,
  showOverlay: boolean
}

export type PokerTableData = {
  api: ModuleApi
  communityCards: PokerCard[]
  handCards: PokerHandCard | null,
  isRunning: boolean,
  phase: PokerPhase,
  players: string[],
  round: number,
  running: boolean
}

export type PokerTablePositionData = {
  api: ModuleApi,
  handCards: PokerHandCard | null,
  players: string[],
  position: number
}

export type CommunityCardData = {
  cards: PokerCard[],
  phase: PokerPhase
}