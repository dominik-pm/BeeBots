import { NextFunction, Request, Response } from 'express'
import { PhemexAccountInfo, PhemexAccountPosition, PhemexClosedTrade, PhemexOpenOrder, PhemexRequestOptions, PhemexUserTrade } from '../@types/phemexapi'
import { ClosedTrade, OpenOrder, Position } from '../@types/phemexhandler'
import { decryptOptions, evAmountToBTCAmount, handleResponse, logErrorCode, priceEpToPrice } from '../helper/phemexapihelper'
import { PhemexClient } from '../phemexclient/phemex-api-client'
import { logErr } from '../middleware/logger'




export function test() {
    const options: PhemexRequestOptions = {
        apiKey: "ea7308fd-c9d6-4884-ad92-da6b8cd6aaa9",
        secret: "gx2-UEdHM2ZIj_gRpKfm1YmbptZwq7nxGDXrWkR48t1mNzRlYWM0Ny1hMTBhLTRlYzQtYmY1Ni1jNjI2YjE3ODYxYzU",
        isLivenet: false
    }

    // return testCcxt();

    // return PhemexClient.QueryClientsAndWallets({}, options)

    // return PhemexClient.QueryTradingAccountAndPositions({currency: 'BTC'}, options)

    // return PhemexClient.Query24HourTicker({symbol: 'BTCUSD'})

}

declare type AccountInfoResponse = {
    userID: number,
    btcBalance: number
}
export function getAccountInfo(req: any, res: Response, next: NextFunction) {
    const options = decryptOptions(req.token)

    queryAccountInfo(options)
    .then(account => {
        req.toSend = account
        next()
    })
    .catch(err => {
        console.log('phemex responded with error:', err)
        let msg = logErrorCode(err)
        // throw({message: msg})
        logErr({message: msg}, req, res, next)
    })
}
export function getActiveTrade(req: any, res: Response, next: NextFunction) {
    const options = decryptOptions(req.token)

    queryCurrentPosition(options)
    .then(position => {
        req.toSend = {position}
        next()
    })
    .catch((err) => {
        console.log('phemex responded with error:', err)
        let msg = logErrorCode(err)
        // throw({message: msg})
        logErr({message: msg}, req, res, next)
    })
}

// TODO: right now, just for checking if a limit order is filled
export function getClosedTrades(req: any, res: Response, next: NextFunction) {
    const options = decryptOptions(req.token)

    queryPhemexClosedTrades(options)
    .then(trades => {
        const formattedTrades: ClosedTrade[] = getTrades(trades)

        req.toSend = {trades: formattedTrades}
        next()
    })
    .catch((err) => {
        console.log('phemex responded with error:', err)
        let msg = logErrorCode(err)
        // throw({message: msg})
        logErr({message: msg}, req, res, next)
    })
}

export function getActiveOrders(req: any, res: Response, next: NextFunction) {
    const options = decryptOptions(req.token)

    queryPhemexOrders(options)
    .then(orders => {
        // console.log(orders)

        req.toSend = {orders}
        next()
    })
    .catch((err) => {
        console.log('phemex responded with error:', err)
        let msg = logErrorCode(err)
        // throw({message: msg})
        logErr({message: msg}, req, res, next)
    })
}


export function queryAccountInfo(options: any): Promise<AccountInfoResponse | null> {
    return new Promise<AccountInfoResponse | null>((resolve, reject) => {
        PhemexClient.QueryTradingAccountAndPositions({currency: 'BTC'}, options)
        .then((data: any) => {
            data = handleResponse(data)

            const formattedAccountData = getAccountData(<PhemexAccountInfo>data)

            resolve(formattedAccountData)
        })
        .catch((err) => {
            reject(err)
        })

    })
}

// TODO: not working / cant get pnl details
function queryPhemexClosedTrades2(options: any): Promise<PhemexClosedTrade[]> {
    return new Promise<PhemexClosedTrade[]>((resolve, reject) => {

        PhemexClient.QueryClosedOrdersBySymbol({symbol: 'BTCUSD'}, options)
        .then((data: any) => {
            const trades = data.result.rows.filter((trade: any) => trade.ordStatus == 'Filled')
            
            console.log('closed trades:')
            console.log(trades)
            
            resolve(trades)
        })
        .catch(err => {
            reject(err)
        })
    })
}
function queryPhemexClosedTrades(options: any): Promise<PhemexUserTrade[]> {
    return new Promise<PhemexUserTrade[]>((resolve, reject) => {
        // PhemexClient.QueryRecentTrades({symbol: 'BTCUSD'}, options)
        // .then((data: any) => {
        //     console.log('recent trades:')
        //     console.log(data.result.trades[0])
        //     console.log(data.result.trades[1])
        // })
        // .catch(err => {
        //     // reject(err)
        // })

        // PhemexClient.QueryClosedOrdersBySymbol({symbol: 'BTCUSD'}, options)
        // .then((data: any) => {
        //     const trades = data.result.rows.filter((trade: any) => trade.ordStatus == 'Filled')
            
        //     console.log('usertrades:')
        //     console.log(trades)
            
        //     resolve(trades)
        // })
        // .catch(err => {
        //     reject(err)
        // })

        // contain pnl details
        PhemexClient.QueryUserTrades({symbol: 'BTCUSD'}, options)
        .then((data: any) => {
            const trades: PhemexUserTrade[] = <PhemexUserTrade[]>data.result.rows
            resolve(trades)
        })
        .catch(err => {
            reject(err)
        })
    })
}

export function queryCurrentPosition(options: PhemexRequestOptions) {
    return new Promise<Position | null>((resolve, reject) => {

        PhemexClient.QueryTradingAccountAndPositions({currency: 'BTC'}, options)
        .then((data: any) => {
            data = handleResponse(data)

            getPosition(options, <PhemexAccountInfo>data)
            .then(position => {
                resolve(position)
            })
            .catch(err => {
                reject(err)
            })

        })
        .catch((err) => {
            reject(err)
        })

    })
}

export function queryPhemexOrders(options: any): Promise<OpenOrder[]> {
    return new Promise<OpenOrder[]>((resolve, reject) => {
        PhemexClient.QueryOpenOrdersBySymbol({symbol: 'BTCUSD'}, options)
        .then((data: any) => {
            const orders: PhemexOpenOrder[] = <PhemexOpenOrder[]>data.result.rows
            resolve(getOrders(orders))
        })
        .catch(err => {
            if (err.code && err.code == 10002) {
                // there are no open orders
                resolve([])
            }
            reject(err)
        })
    })
}


function getAccountData(data: PhemexAccountInfo): AccountInfoResponse | null {
    if (!data) return null
    
    const formattedAccountData: AccountInfoResponse = {
        userID: data.account.userID,
        btcBalance: (data.account.accountBalanceEv / 100000000)
    }

    // console.log(data.positions.length)
    // console.log(data.positions[0])

    return formattedAccountData
}
async function getPosition(options: any, data: PhemexAccountInfo): Promise<Position | null> {
    return new Promise<Position | null>((resolve, reject) => {

        let position: Position | null = null

        if (!data || !data.positions || data.positions.length == 0) resolve(null)

        const btcPosition = <PhemexAccountPosition>data.positions.find((pos: any) => pos.symbol == 'BTCUSD')


        if (!btcPosition || !btcPosition.avgEntryPrice) resolve(null)

        queryPhemexOrders(options)
        .then(orders => {

            let stopLoss = null
            let takeProfit = null

            position = {
                entryPrice: btcPosition.avgEntryPrice,
                side: btcPosition.side,
                leverage: btcPosition.leverage,
                quantity: btcPosition.size,
                stopLoss,
                takeProfit
            }
            
            if (orders.length == 0)  {
                // there is definitely no SL or TP
                resolve(position)
            }

            // the order should contain the stop loss and optionally also the takeprofit

            // find stop loss order
            const stopLossOrders = orders.filter(order => order.type == 'Stop' && order.side != btcPosition.side)

            if (stopLossOrders.length > 0) {
                // find the closed stop loss (others can be ignored)
                stopLossOrders.sort((a, b) => btcPosition.side == 'Buy' ? b.price - a.price : a.price - b.price)

                stopLoss = stopLossOrders[0].price

                if (stopLossOrders.length > 1) {
                    // console.log('Got more than 1 stop loss order:')
                    // console.log(stopLossOrders)
                }
            }

            
            // find take profit order
            const takeProfitOrders = orders.filter(order => 
                order.type != 'Stop'
                && order.side != btcPosition.side
                // && order.quantity == btcPosition.size
            )

            if (takeProfitOrders.length > 0) {
                // find the first takeprofit order (closest to entry price)
                takeProfitOrders.sort((a, b) => btcPosition.side == 'Buy' ? a.price - b.price : b.price - a.price)

                // check if the quantity is correct
                if (takeProfitOrders[0].quantity == btcPosition.size) {
                    takeProfit = takeProfitOrders[0].price
                }

            }

            position.stopLoss = stopLoss
            position.takeProfit = takeProfit
            // console.log(position)

            resolve(position)
        })
        .catch(err => {
            reject(err)
        })

    })
}
function getOrders(data: PhemexOpenOrder[]): OpenOrder[] {
    const formattedOrders: OpenOrder[] = data.map(order => {
        return {
            orderID: order.orderID,
            side: order.side,
            type: order.orderType,
            stopDirection: order.stopDirection,
            quantity: order.orderQty,
            status: order.ordStatus,
            price: order.orderType == 'Stop' ? order.stopPx : order.price
        }
    })

    return formattedOrders
}
function getTrades(data: PhemexUserTrade[]): ClosedTrade[] {
    const formattedTrades: ClosedTrade[] = data.map(trade => {
        return {
            transactTimeNs: trade.transactTimeNs,
            orderID: trade.orderID,
            clOrdID: trade.clOrdID,
            side: trade.side,
            type: trade.ordType,
            quantity: trade.orderQty,
            execQty: trade.execQty,
            closedPnl: evAmountToBTCAmount(trade.closedPnlEv),
            execFee: evAmountToBTCAmount(trade.execFeeEv),
            execPrice: priceEpToPrice(trade.execPriceEp)
        }
    })

    return formattedTrades
}
// function getTrades(data: PhemexClosedTrade[]): ClosedTrade[] {
//     const formattedTrades: ClosedTrade[] = data.map(trade => {
//         return {
//             orderID: trade.orderID,
//             clOrdID: trade.clOrdID,
//             side: trade.side,
//             type: trade.orderType,
//             quantity: trade.cumQty,
//             status: trade.ordStatus,
//             closedSize: trade.closedSize,
//             pnl: trade.closedPnlEv,         // TODO: DOESNT SOMEHOW TAKE FEES INTO CONSIDERATION AMK
//             price: priceEpToPrice(trade.priceEp),
//             stopLoss: priceEpToPrice(trade.stopLossEp)
//         }
//     })

//     return formattedTrades
// }