import { NextFunction, Response } from 'express'
import { PhemexOrderCreatedResponse, PhemexRequestOptions } from '../@types/phemexapi'
import { OpenOrder, orderSide, Position } from '../@types/phemexhandler'
import { decryptOptions, logErrorCode, priceToPriceEp } from '../helper/phemexapihelper'
import { PhemexClient } from '../phemexclient/phemex-api-client'
import { queryCurrentPosition, queryPhemexOrders } from './account'

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

    const price = entryReq.price
    const orderID = entryReq.orderID || generateRandomID()
    const stopLoss = entryReq.stopLoss
    const quantity = 500//entryReq.quantity // TODO: should be a percentage of account -> also check leverage,...
    const side: orderSide = entryReq.side

    getPositionAndOrders(options)
    .then(result => {
        const { orders, position } = result

        if (position) {
            next({status: 400, message: 'Can not place entry when there is an open position!'})
            return
        }

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
                priceEp: priceToPriceEp(price),
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

        })
    })
    .catch(err => {
        console.log('can not get position and orders')
        next({message: 'Can not get position and orders!'})
    })
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