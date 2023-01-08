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
    round: number,
    running: boolean
}

export type PokerConfigProps = {
    api: ModuleApi,
    config: PokerConfigType,
    isRoomMaster:boolean
}