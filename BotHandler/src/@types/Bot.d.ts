declare module 'bot'

export declare type TradingPermission = 'live' | 'testnet' | 'simulated'
export declare type Action = 'long' | 'short'

export interface BotAccountInfo {
    activeLimitEntryOrderID: string | null = null
    balance: number
    entryOrderID: string | null
    entryPnl: number
}

export interface ActiveTrade {
    isFilled: boolean
    side: Action
    entryPrice: number
    originalStopLoss: number
    stopLoss: number | null
    takeProfit: number | null
    exitPrice: number | null
}
export interface ClosedTrade {
    side: Action
    entryPrice: number
    originalStopLoss: number
    stopLoss: number
    takeProfit: number | null
    exitPrice: number
}
export interface Transaction {
    entryPrice: number
    exitPrice: number
    stopLoss: number | null
    target: number | null
    percentageProfit: number
    profit: number
    exitTime: String
    action: Action
}
export interface RiskProfile {
    tradeThreshhold: number         // percentage
    capitalRiskPerTrade: number     // percentage
    stopLossDistance: number        // percentage
}