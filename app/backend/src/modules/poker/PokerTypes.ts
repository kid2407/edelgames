export type PokerConfig = {
    startingMoney: number
    smallBlind: number
    bigBlind: number
    firstBlindRaise: number
    firstBlindFactor: number
    secondBlindRaise: number,
    secondBlindFactor: number
}

export enum PokerCardType {
    CLUBS = 'clubs',
    DIAMONDS = 'diamonds',
    HEARTS = 'hearts',
    SPADES = 'spades'
}

export type PokerCard = {
    suit: PokerCardType,
    value: number
}

export type PokerGameState = {
    running: boolean,
    config: PokerConfig,
    round: number,
    deck: PokerCard[]
}