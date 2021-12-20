declare module 'phemexhandler'

export interface MarketData {
    currentPrice: number,
    marketData: {
        close: number,
        fundingRate: number,
        high: number,
        indexPrice: number,
        low: number,
        markPrice: number,
        open: number,
        openInterest: number,
        predFundingRate: number,
        symbol: BTCUSD,
        timestamp: number,
        turnover: number,
        volume: number
    }
}