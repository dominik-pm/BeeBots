declare module 'positionalgo'

export interface PositionAlgoRequest {
    currentPrice: number,
    entryPrice: number,
    originalStopLoss: number,
    stopLoss: number | null,
    takeProfit: number | null
}

export interface PositionAlgoResponse {
    stopLoss: number,
    takeProfit: number
}
