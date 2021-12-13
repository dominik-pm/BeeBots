declare module 'positionalgo'

export interface PositionAlgoRequest {
    currentPrice: number,
    entryPrice: number,
    stopLoss: number,
    originalStopLoss: number,
    takeProfit: number | null
}

export interface PositionAlgoResponse {
    stopLoss: number,
    takeProfit: number
}
