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

export type PokerGameState = {
    bets: {
        [userId: string]: number
    },
    communityCards: PokerCard[],
    config: PokerConfig,
    currentlyActiveUser: number
    dealerIndex: number,
    deck: PokerCard[],
    handCards: {
        [userId: string]: PokerHandCard
    }
    highestRaise: number | null,
    lastRaiseBy: string | null,
    phase: PokerPhase,
    pot: number,
    round: number,
    running: boolean,
    players: string[]
}