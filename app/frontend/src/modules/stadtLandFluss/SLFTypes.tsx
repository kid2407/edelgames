import ModuleGameApi from "../../framework/modules/ModuleGameApi";

export type gameConfig = {
    categories: string[],
    rounds: number
}
export type Guesses = {
    [userId: string]: {
        [letter: string]: string[]
    }
}
export type Points = {
    [letter: string]: {
        [category: number]: {
            [userId: string]: number
        }
    }
}
export type PointOverrides = {
    [userId: string]: {
        [categoryIndex: string]: string[]
    }
}
export type gameState = {
    active: boolean,
    players: string[],
    config: gameConfig,
    round: number | null,
    guesses: Guesses,
    gamePhase: string,
    letter: string,
    ready_users: number,
    points: Points,
    point_overrides: {
        [userId: string]: {
            [categoryIndex: string]: string[]
        }
    }
}
export type RoundResultProps = {
    isRoomMaster: boolean
    gameApi: ModuleGameApi
    round: number,
    max_rounds: number
    letter: string,
    players: string[],
    guesses: Guesses,
    categories: string[],
    points: Points,
    point_overrides: PointOverrides
}

export type ConfigProps = {
    isRoomMaster: boolean,
    gameApi: ModuleGameApi,
    config: {
        rounds: number,
        categories: string[]
    }
}
export type EndResultProps = {
    points: Points,
    isRoomMaster: boolean,
    gameApi: ModuleGameApi
}
export type GuessingProps = {
    isRoomMaster: boolean,
    gameApi: ModuleGameApi,
    categories: string[],
    letter: string,
    guesses: Guesses,
    round: number,
    max_rounds: number,
    ready_users: number,
    user_count: number
}