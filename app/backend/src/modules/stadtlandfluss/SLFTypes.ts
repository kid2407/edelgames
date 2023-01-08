type gameConfig = {
    categories: string[],
    rounds: number
}
type guesses = {
    [userId: string]: {
        [letter: string]: string[]
    }
}
type points = {
    [letter: string]: {
        [category: number]: {
            [userId: string]: number
        }
    }
}
export type gameState = {
    active: boolean,
    players: object | any,
    config: gameConfig,
    round: number,
    guesses: guesses,
    gamePhase: string,
    letter: string,
    ready_users: string[],
    points: points,
    point_overrides: {
        [userId: string]: {
            [categoryIndex: string]: string[]
        }
    }
}