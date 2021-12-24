declare module 'phemexhandler'

export declare type orderType = 'Limit' | 'Market' | 'Stop'
export declare type orderSide = 'Buy' | 'Sell'
export declare type fillStatus = 'TakerFill' | 'MakerFill'

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
    stopLoss: number,
    takeProfit: number
}