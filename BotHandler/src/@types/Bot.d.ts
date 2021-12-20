declare module 'bot'

export declare type TradingPermission = 'live' | 'testnet' | 'simulated'
export interface ActiveTrade {
    isFilled: boolean
    side: 'long' | 'short'
    entryPrice: number
    originalStopLoss: number
    stopLoss: number
    takeProfit: number | null
    exitPrice: number | null
}
export interface ClosedTrade {
    side: 'long' | 'short'
    entryPrice: number
    originalStopLoss: number
    stopLoss: number
    takeProfit: number | null
    exitPrice: number
}
export interface Transaction {
    entryPrice: number
    exitPrice: number
    profit: number
}
export interface RiskProfile {
    tradeThreshhold: number         // percentage
    capitalRiskPerTrade: number     // percentage
    stopLossDistance: number        // percentage
}