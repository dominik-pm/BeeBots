declare module 'phemexhandler'

export declare type orderType = 'Limit' | 'Market' | 'Stop' | 'StopLimit' | 'MarketIfTouched' | 'LimitIfTouched' | 'MarketAsLimit' | 'StopAsLimit' | 'MarketIfTouchedAsLimit'
export declare type orderSide = 'Buy' | 'Sell'
export declare type orderStatus = 'Filled' | 'New'
export declare type fillStatus = 'TakerFill' | 'MakerFill'

export declare type MarketData = {
    close: number,
    fundingRate: number,
    high: number,
    indexPrice: number,
    low: number,
    markPrice: number,
    open: number,
    openInterest: 0,
    predFundingRate: number,
    symbol: string,
    timestamp: number,
    turnover: number,
    volume: number,
    currentPrice: number
}

export declare type OpenOrder = {
    orderID: string,
    side: orderSide,
    type: orderType,
    stopDirection: string,
    quantity: number,
    price: number,
    status: string
}

export declare type Position = {
    entryPrice: number,
    side: orderSide,
    leverage: number,
    quantity: number,
    stopLoss: number | null,
    takeProfit: number | null
}

export declare type ClosedTrade = {
    transactTimeNs: number,
    orderID: string,
    clOrdID: string,
    side: orderSide,
    type: orderType,
    quantity: number,
    execQty: number,
    closedPnl: number,
    execFee: number,
    execPrice: number
}
// export declare type ClosedTrade = {
//     orderID: string,
//     clOrdID: string,
//     side: orderSide,
//     type: orderType,
//     quantity: number,
//     status: orderStatus,
//     price: number
//     pnl: number,
//     closedSize: number,
//     stopLoss: number
// }