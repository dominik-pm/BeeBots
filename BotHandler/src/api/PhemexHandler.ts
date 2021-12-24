import jwt from 'jsonwebtoken'
import { secretToken } from '../index'
import axios from 'axios'
import { MarketDataResponse } from '../@types/api/PhemexHandler'
import { formatAxiosError, getAxiosRequestConfig } from './Api'

export declare type orderSide = 'Buy' | 'Sell'
export declare type orderType = 'Limit' | 'Market' | 'Stop' | 'StopLimit' | 'MarketIfTouched' | 'LimitIfTouched' | 'MarketAsLimit' | 'StopAsLimit' | 'MarketIfTouchedAsLimit'


// --> MARKET DATA
export async function getMarketData(): Promise<MarketDataResponse> {
    return new Promise((resolve, reject) => {

        const payload = {}
        const token = jwt.sign(payload, secretToken)

        axios.get('http://phemexhandler.azurewebsites.net/marketdata', getAxiosRequestConfig(token))
        .then(res => {
            resolve(res.data)
        })
        .catch(err => {
            reject(formatAxiosError(err))
        })

    })
}

// <--

// --> ACCOUNT
declare type AccountInfoResponse = {
    userID: number,
    btcBalance: number
}
export async function getAccountInfo(token: string): Promise<AccountInfoResponse> {
    return new Promise((resolve, reject) => {

        axios.get('http://phemexhandler.azurewebsites.net/account', getAxiosRequestConfig(token))
        .then(res => {
            const account: AccountInfoResponse = res.data
            resolve(account)
        })
        .catch(err => {
            reject(formatAxiosError(err))
        })

    })
}
export declare type Position = {
    entryPrice: number,
    side: orderSide,
    leverage: number,
    quantity: number,
    stopLoss: number | null,
    takeProfit: number | null
}
export async function getOpenPosition(token: string): Promise<Position | null> {
    return new Promise((resolve, reject) => {

        axios.get('http://phemexhandler.azurewebsites.net/account/openposition', getAxiosRequestConfig(token))
        .then(res => {
            const position: Position | null = res.data
            resolve(position)
        })
        .catch(err => {
            reject(formatAxiosError(err))
        })

    })
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
export async function getOpenOrders(token: string): Promise<OpenOrder[]> {
    return new Promise((resolve, reject) => {

        axios.get('http://phemexhandler.azurewebsites.net/account/openorders', getAxiosRequestConfig(token))
        .then(res => {
            const openOrders: OpenOrder[] = res.data
            resolve(openOrders)
        })
        .catch(err => {
            reject(formatAxiosError(err))
        })

    })
}
export async function getClosedTrades(token: string): Promise<any> {
    return new Promise((resolve, reject) => {

        axios.get('http://phemexhandler.azurewebsites.net/account/closedtrades', getAxiosRequestConfig(token))
        .then(res => {
            resolve(res.data)
        })
        .catch(err => {
            reject(formatAxiosError(err))
        })

    })
}
// <--

// --> ORDER
declare type PlaceEntryRequest = {
    price: number,
    orderID?: string,
    quantity: number,
    stopLoss: number,
    side: orderSide
}

export async function placeEntryOrder(token: string, price: number, stopLoss: number, side: orderSide, accountPercQty: number): Promise<any> {
    return new Promise((resolve, reject) => {

        const requestOptions: PlaceEntryRequest = {
            price,
            quantity: accountPercQty,
            orderID: '123564789645',
            stopLoss,
            side
        }

        axios.post('http://phemexhandler.azurewebsites.net/order/placeentry', requestOptions, getAxiosRequestConfig(token))
        .then(res => {
            resolve(res.data)
        })
        .catch(err => {
            reject(formatAxiosError(err))
        })

    })
}
declare type PlaceTakeProfitRequest = {
    takeProfit: number
}
declare type PlaceOrderResponse = {
    message: string,
    orderID: string,
    clOrdID: string
}
export async function placeTakeProfit(token: string, takeProfit: number): Promise<PlaceOrderResponse> {
    return new Promise((resolve, reject) => {

        const requestOptions: PlaceTakeProfitRequest = {
            takeProfit
        }

        axios.post('http://phemexhandler.azurewebsites.net/order/placetakeprofit', requestOptions, getAxiosRequestConfig(token))
        .then(res => {
            const response: PlaceOrderResponse = res.data
            resolve(response)
        })
        .catch(err => {
            reject(formatAxiosError(err))
        })

    })
}
declare type PlaceStopLossRequest = {
    stopLoss: number
}
export async function placeStopLoss(token: string, stopLoss: number): Promise<PlaceOrderResponse> {
    return new Promise((resolve, reject) => {

        const requestOptions: PlaceStopLossRequest = {
            stopLoss
        }

        axios.post('http://phemexhandler.azurewebsites.net/order/placestoploss', requestOptions, getAxiosRequestConfig(token))
        .then(res => {
            const response: PlaceOrderResponse = res.data
            resolve(response)
        })
        .catch(err => {
            reject(formatAxiosError(err))
        })

    })
}
export async function cancelOrder(token: string, orderID: string): Promise<any> {
    return new Promise((resolve, reject) => {


        axios.delete(`http://phemexhandler.azurewebsites.net/order/${orderID}`, getAxiosRequestConfig(token))
        .then(res => {
            resolve(res.data)
        })
        .catch(err => {
            reject(formatAxiosError(err))
        })

    })
}
export async function closeAll(token: string): Promise<any> {
    return new Promise((resolve, reject) => {

        axios.delete(`http://phemexhandler.azurewebsites.net/order/closeall`, getAxiosRequestConfig(token))
        .then(res => {
            resolve(res.data)
        })
        .catch(err => {
            reject(formatAxiosError(err))
        })

    })
}
// <--

