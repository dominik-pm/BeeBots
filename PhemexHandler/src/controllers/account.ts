import { NextFunction, Request, Response } from 'express'
import { PhemexAccountInfo, PhemexAccountPosition, PhemexClosedTrade, PhemexOpenOrder, PhemexRequestOptions } from '../@types/phemexapi'
import { OpenOrder, Position } from '../@types/phemexhandler'
import { decryptOptions, handleResponse, logErrorCode } from '../helper/phemexapihelper'
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

export function getAccountInfo(req: any, res: Response, next: NextFunction) {
    const options = decryptOptions(req.token)

    PhemexClient.QueryTradingAccountAndPositions({currency: 'BTC'}, options)
    .then((data: any) => {
        data = handleResponse(data)

        const formattedAccountData = getAccountData(<PhemexAccountInfo>data)

        req.toSend = formattedAccountData//data
        next()
    })
    .catch((err) => {
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

// TODO: not getting correct info -> this method is import to determine the pnl of the last trade
export function getClosedTrades(req: any, res: Response, next: NextFunction) {
    const options = decryptOptions(req.token)

    queryPhemexClosedTrades(options)
    .then(trades => {
        // const formattedTrades = getTrades(trades)

        req.toSend = {trades: trades}//formattedTrades
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
        console.log(orders)

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



// TODO: not working / cant get pnl details
function queryPhemexClosedTrades(options: any): Promise<PhemexClosedTrade[]> {
    return new Promise<PhemexClosedTrade[]>((resolve, reject) => {
        // PhemexClient.QueryRecentTrades({symbol: 'BTCUSD'}, options)
        PhemexClient.QueryClosedOrdersBySymbol({symbol: 'BTCUSD'}, options)
        .then((data: any) => {
            const trades = data.result.rows.filter((trade: any) => trade.ordStatus == 'Filled')
            
            console.log('usertrades:')
            console.log(trades)
            
            resolve(trades)
        })
        .catch(err => {
            reject(err)
        })

        // PhemexClient.QueryUserTrades({symbol: 'BTCUSD'}, options)
        // .then((data: any) => {
        //     const trades: PhemexClosedTrade[] = <PhemexClosedTrade[]>data.rows
        //     resolve(trades)
        // })
        // .catch(err => {
        //     reject(err)
        // })
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


function getAccountData(data: PhemexAccountInfo): any {
    if (!data) return null
    
    const formattedAccountData = {
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
function getTrades(data: PhemexClosedTrade[]): any {
    const formattedTrades = data.map(trade => {
        return {
            orderID: trade.orderID,
            side: trade.side,
            type: trade.ordType,
            quantity: trade.closedSize,
            status: trade.execStatus
        }
    })

    return formattedTrades
}