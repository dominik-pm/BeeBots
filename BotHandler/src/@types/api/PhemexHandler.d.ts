declare module 'phemexhandler'

export declare type orderType = 'Limit' | 'Market' | 'Stop' | 'StopLimit' | 'MarketIfTouched' | 'LimitIfTouched' | 'MarketAsLimit' | 'StopAsLimit' | 'MarketIfTouchedAsLimit'
export declare type orderSide = 'Buy' | 'Sell'
export declare type orderStatus = 'Filled' | 'New'
// export declare type fillStatus = 'TakerFill' | 'MakerFill'

export interface MarketDataResponse {
    currentPrice: number,
    symbol: BTCUSD,
    open: number,
    close: number,
    high: number,
    low: number,
    indexPrice: number,
    markPrice: number,
    openInterest: number,   // IN CONTRACTS
    fundingRate: number,    // IN PERCENTAGE
    predFundingRate: number,// IN PERCENTAGE
    timestamp: number,
    turnover: number,       // IN BTC
    volume: number          // IN USD
}

export declare type PlaceEntryResponse = {
    message: string,
    orderID: string
}

export declare type ClosedTradeResponse = {
    transactTimeNs: number,
    orderID: string,
    clOrdID: string,
    side: orderSide,
    type: orderType,
    quantity: number,
    closedPnl: number,
    execFee: number,
    execPrice: number
}
// export declare type PhemexUserTrade = {
//     transactTimeNs: number,
//     symbol: string,
//     currency: string,
//     action: string,
//     side: orderSide,
//     tradeType: string,
//     execQty: number,
//     execPriceEp: number,
//     orderQty: number,
//     priceEp: number,
//     execValueEv: number,
//     feeRateEr: number,   
//     execFeeEv: number,     // without entry fee
//     closedSize: number,
//     closedPnlEv: number, // without fee
//     ordType: orderType,
//     execID: string,
//     orderID: string,
//     clOrdID: string,
//     execStatus: fillStatus
// }
// export declare type ClosedTradeResponse = {
//     orderID: string,
//     clOrdID: string,
//     side: orderSide,
//     type: orderType,
//     quantity: number,
//     status: orderStatus,
//     price: number
//     closedSize: number,
//     pnl: number,
//     stopLoss: number
// }