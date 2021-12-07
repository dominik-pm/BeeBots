declare module 'buyAlgo'

export interface BuyAlgoResponse {
    action: 'Buy' | 'Sell'
    confidence: Number
}