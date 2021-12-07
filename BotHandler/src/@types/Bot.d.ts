declare module 'bot'

export declare type TradingPermission = 'live' | 'testnet' | 'simulated'
export interface ActiveTrade {
    isFilled: Boolean
    side: 'long' | 'short'
    entryPrice: Number
    stopLoss: Number
    takeProfit: Number | null
    exitPrice: Number | null
}
export interface Transaction {
    entryPrice: Number
    exitPrice: Number
    profit: Number
}
export interface RiskProfile {
    tradeThreshhold: Number         // percentage
    capitalRiskPerTrade: Number     // percentage
}