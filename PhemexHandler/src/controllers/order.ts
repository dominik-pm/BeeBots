import { NextFunction, Response } from 'express'
import { PhemexOrderCreatedResponse, PhemexRequestOptions } from '../@types/phemexapi'
import { OpenOrder, orderSide, Position } from '../@types/phemexhandler'
import { convertToEr, decryptOptions, logErrorCode, priceToPriceEp } from '../helper/phemexapihelper'
import { PhemexClient } from '../phemexclient/phemex-api-client'
import { getAccountInfo, queryAccountInfo, queryCurrentPosition, queryPhemexOrders } from './account'

declare type PlaceEntryRequest = {
    price: number,
    orderID?: string,
    quantity: number,
    stopLoss: number,
    side: orderSide
}

declare type PlaceTakeProfitRequest = {
    takeProfit: number
}

declare type PlaceStopLossRequest = {
    stopLoss: number
}

export function placeEntry(req: any, res: Response, next: NextFunction) {
    const options = decryptOptions(req.token)

    const entryReq: PlaceEntryRequest = <PlaceEntryRequest>req.body

    const entryPrice = entryReq.price
    const orderID = entryReq.orderID || generateRandomID()
    const stopLoss = entryReq.stopLoss
    const quantityPerc = entryReq.quantity
    const side: orderSide = entryReq.side

    getPositionAndOrders(options)
    .then(result => {
        const { orders, position } = result
        
        if (position) {
            next({status: 400, message: 'Can not place entry when there is an open position!'})
            return
        }

        queryAccountInfo(options)
        .then(account => {

            if (!account) {
                next({message: 'Can not get account info!'})
                return
            }

            const stopDist = entryPrice - stopLoss
            const quantity = Math.floor(Math.abs(((quantityPerc*account.btcBalance*entryPrice)/stopDist)*stopLoss))

            const leverage: null | number = getLeverage(quantity, account.btcBalance, entryPrice)

            if (!leverage) {
                next({status: 400, message: `Invalid order size: ${quantity}; Cannot set leverage!`})
                return
            }

            console.log('TODO: change leverage to:', leverage)
            console.log(`Trying to open a position with a ${quantity} contract size!`)

            // postSetLeverage(leverage, options)
            // .then(lvgSuccess => {
            //     console.log('Successfully changed leverage to', leverage)
            //     console.log(lvgSuccess)


                // cancel all orders
                postCancelMultipleOrders(orders, options)
                .then(success => {

                    PhemexClient.PlaceOrder({
                        symbol: 'BTCUSD',
                        clOrdID: orderID,
                        side,
                        orderQty: quantity,
                        ordType: 'Limit',
                        timeInForce: 'GoodTillCancel', // TODO: maybe post only - but requires further error handling (if its cancel the order still says it is created)
                        priceEp: priceToPriceEp(entryPrice),
                        slTrigger: 'ByMarkPrice',
                        stopLossEp: priceToPriceEp(stopLoss),
                    }, options)
                    .then(res => {
                        console.log(res.result)
                        const createdOrder: PhemexOrderCreatedResponse = <PhemexOrderCreatedResponse>res.result
                        req.toSend = {message: 'Successfully placed order!', orderID: createdOrder.orderID}
                
                        next()
                    })
                    .catch(err => {
                        console.log('phemex responded with error:', err)
                        let msg = logErrorCode(err)
                        next({status: 400, message: msg})
                    })


                })
                .catch(err => {
                    console.log(err)
                    next({message: 'Could not cancel orders!'})
                })



            // })
            // .catch(err => {
            //     console.log('Could not change leverage!')
            //     console.log(err)
            //     next({message: 'Could not change leverage!'})
            // })
        })
        .catch(err => {
            console.log('Can not get account info!')
            console.log(err)
            next({message: 'Can not get account info!'})
        })
        
    })
    .catch(err => {
        console.log('can not get position and orders')
        next({message: 'Can not get position and orders!'})
    })
}
// returns minimum amount of leverage required (if it is not possible -> null)
function getLeverage(quantity: number, btcBalance: number, price: number):  null | number {
    const margin = 0.1  // some leftover margin (cant get exact numbers)
    const availableContract1X = btcBalance*price

    // check if user has enough balance available
    if (quantity > availableContract1X*100*(1-margin)) return null

    // get best leverage
    let optimalLeverage = quantity / (availableContract1X*(1-margin))

    // check leverage
    if (optimalLeverage < 1) return 1.00
    if (optimalLeverage > 100) return null
    
    // round leverage to 2 decimals
    optimalLeverage = Math.round(optimalLeverage*100) / 100

    console.log(`Found optimal leverage for ${quantity} contracts and a balance of ${btcBalance}: ${optimalLeverage}`)
    return optimalLeverage
}

// TODO: refactor :(
export function placeTakeProfit(req: any, res: Response, next: NextFunction) {
    const options = decryptOptions(req.token)

    const tpReq = <PlaceTakeProfitRequest>req.body

    const takeProfit = tpReq.takeProfit

    if (!takeProfit) {
        next({status: 400, message: 'Invalid Take Profit'})
        return
    }

    // GET CURRENT POSITION (for side + quantity)
    queryCurrentPosition(options)
    .then(position => {
        if (!position) {
            next({status: 400, message: 'Can not place take profit if there is no open position!'})
            return
        }

        const side = position.side
        const quantity = position.quantity



        // REMOVE ALL PREVIOUT TP ORDERS
        queryPhemexOrders(options)
        .then(orders => {
            // find TP orders
            const takeProfitOrders = orders.filter(order => 
                order.type != 'Stop'
                && order.side != side
            )
            // cancel all TP orders
            takeProfitOrders.forEach(order => {
                const toCancelID = order.orderID

                console.log('Cancelling TP: ' + toCancelID)
                postCancelOrder(toCancelID, options)
            })


            // POST NEW TP ORDER
            postTakeProfit(side == 'Buy' ? 'Sell' : 'Buy', takeProfit, quantity, options)
            .then(order => {
                const createdOrder: PhemexOrderCreatedResponse = <PhemexOrderCreatedResponse>order.result

                console.log('Take Profit set successful!')
                res.status(200).send({
                    message: 'TakeProfit Order set successfully!',
                    orderID: createdOrder.orderID,
                    clOrdID: createdOrder.clOrdID
                })
            })
            .catch(err => {
                let msg = logErrorCode(err)
                next({message: msg})
            })


        })
        .catch(err => {
            next({message: 'Can not get open orders!'})
        })




    })
    .catch((err) => {
        console.log('can not get active position: ', err)
        let msg = logErrorCode(err)
        next({message: msg})
    })
}

export function placeStopLoss(req: any, res: Response, next: NextFunction) {
    const options = decryptOptions(req.token)

    const tpReq = <PlaceStopLossRequest>req.body

    const stopLoss = tpReq.stopLoss

    getPositionAndOrders(options)
    .then(result => {
        const { orders, position } = result

        if (!position) {
            next({status: 400, message: 'Can not place stop loss when there is no open position!'})
            return
        }

        const { side, quantity } = position

        // find stop loss orders
        const stopLossOrders = orders.filter(order => 
            order.type == 'Stop'
            && order.side != side
        )
        // cancel all SL orders
        postCancelMultipleOrders(stopLossOrders, options)
        .then(success => {
            // console.log('success cancelling')

            // POST NEW SL
            postStopLoss(side == 'Buy' ? 'Sell' : 'Buy', stopLoss, quantity, options)
            .then(order => {
                const createdOrder: PhemexOrderCreatedResponse = <PhemexOrderCreatedResponse>order.result

                console.log('Stop Loss set successful!')
                res.status(200).send({
                    message: 'StopLoss Order set successfully!',
                    orderID: createdOrder.orderID,
                    clOrdID: createdOrder.clOrdID
                })
            })
            .catch(err => {
                next({message: 'Stop Loss set unsuccessful!'})
            })


        })
        .catch(err => {
            next({message: 'Could not cancel multiple orders!'})
        })

    })
    .catch(err => {
        console.log('can not get position and orders')
        next({message: 'Can not get position and orders!'})
    })
}

// TODO: retuns server error when order doesnt exist
export function cancelOrder(req: any, res: Response, next: NextFunction) {
    const options = decryptOptions(req.token)
    
    const orderId = req.params.orderId
    
    postCancelOrder(orderId, options)
    .then(res => {
        next()
    })
    .catch(err => {
        console.log('can not cancel order: ', err)
        let msg = logErrorCode(err)
        next({message: msg})
    })

}

// TODO: return internal server error if there is no position open
export function closeAll(req: any, res: Response, next: NextFunction) {
    const options = decryptOptions(req.token)
    
    getPositionAndOrders(options)
    .then(result => {

        const { position, orders } = result

        // cancel pending orders
        postCancelMultipleOrders(orders, options)
        .then(success => {
            console.log('successfully cancelled all orders')
        })
        .catch(err => {
            next({message: 'Could not cancel multiple orders!'})
        })

        // if there is no position open -> done
        if (!position) {
            next()
            return
        }

        const { side, quantity } = position

        const closingSide: orderSide = side == 'Buy' ? 'Sell' : 'Buy'

        // close position
        postMarketOrder(closingSide, quantity, options)
        .then(result => {
            console.log('Successfully posted market order to close position!')
            console.log(result)
            next()
        })
        .catch(err => {
            next({message: 'Could not close position with market order!'})
        })


    })
    .catch(err => {
        console.log('can not get position and orders')
        next({message: 'Can not get position and orders!'})
    })
}

declare type PositionAndOrder = {
    position: Position | null,
    orders: OpenOrder[]
}

function getPositionAndOrders(options: PhemexRequestOptions): Promise<PositionAndOrder> {
    return new Promise<PositionAndOrder>((resolve, reject) => {

        // get position
        queryCurrentPosition(options)
        .then(position => {
            // if (!position) {
            //     reject({message: 'No open position'})
            //     return
            // }

            let result: PositionAndOrder = {
                position,
                orders: []
            }

            // get orders
            queryPhemexOrders(options)
            .then(orders => {
                result.orders = orders

                resolve(result)
            })
            .catch(err => {
                reject({message: 'Can not get open orders'})
            })


        })
        .catch((err) => {
            reject(err)
        })
    })
}

function postSetLeverage(leverage: number, options: PhemexRequestOptions): Promise<any> {
    const leverageEr: number = convertToEr(leverage)
    return PhemexClient.ChangeLeverage({
        symbol: 'BTCUSD',
        leverage: leverage,
        leverageEr: convertToEr(leverage)
    }, options)
}
function postMarketOrder(side: orderSide, quantity: number, options: PhemexRequestOptions): Promise<any> {
    return PhemexClient.PlaceOrder({
        symbol: 'BTCUSD',
        clOrdID: generateRandomID(),
        side,
        timeInForce: 'GoodTillCancel',
        orderQty: quantity,
        ordType: 'Market'
    }, options)
}
function postTakeProfit(side: orderSide, price: number, quantity: number, options: PhemexRequestOptions): Promise<any> {
    return PhemexClient.PlaceOrder({
        symbol: 'BTCUSD',
        clOrdID: generateRandomID(),
        side,
        reduceOnly: true,
        timeInForce: 'GoodTillCancel',
        orderQty: quantity,
        priceEp: priceToPriceEp(price),
        ordType: 'Limit',
    }, options)
}
function postStopLoss(side: orderSide, price: number, quantity: number, options: PhemexRequestOptions): Promise<any> {
    return PhemexClient.PlaceOrder({
        symbol: 'BTCUSD',
        clOrdID: generateRandomID(),
        side,
        orderQty: quantity,
        ordType: 'Stop',
        stopPxEp: priceToPriceEp(price),
        triggerType: 'ByMarkPrice'
    }, options)
}

async function postCancelMultipleOrders(orders: OpenOrder[], options: PhemexRequestOptions) {
    await orders.forEach(order => {
        const toCancelID = order.orderID

        console.log('Cancelling order: ' + toCancelID)
        Promise.resolve(postCancelOrder(toCancelID, options))
    })
}
function postCancelOrder(orderID: string, options: PhemexRequestOptions): Promise<any> {
    return PhemexClient.CancelSingleOrder({orderID, symbol: 'BTCUSD'}, options)
}



function generateRandomID() {
    return Math.trunc(Math.random()*1000000000000).toString()
}