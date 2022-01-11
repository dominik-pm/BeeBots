declare module 'buyAlgo'

export interface BuyAlgoRequest {
    symbol: string
    indexPrice: number
    markPrice: number
    close: number
    high: number
    low: number
    open: number
    fundingRate: number
    predFundingRate: number
    openInterest: number
    turnover: number
    volume: number
    timestamp: number
    currentPrice: number
}

export interface BuyAlgoResponse {
    action: 'Buy' | 'Sell'
    confidence: number
}