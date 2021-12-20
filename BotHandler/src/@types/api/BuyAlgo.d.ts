declare module 'buyAlgo'

export interface BuyAlgoRequest {
    currentPrice: number,
    marketData: {
        longInterest: number,
        dailyHigh: number,
        dailyLow: number
    }
}

export interface BuyAlgoResponse {
    action: 'Buy' | 'Sell'
    confidence: number
}