import jwt from 'jsonwebtoken'
import { secretToken } from '../index'
import axios from 'axios'
import { ClosedTradeResponse, MarketDataResponse, PlaceEntryResponse } from '../@types/api/PhemexHandler'
import { formatAxiosError, getAxiosRequestConfig } from './Api'

export declare type orderSide = 'Buy' | 'Sell'
export declare type orderType = 'Limit' | 'Market' | 'Stop' | 'StopLimit' | 'MarketIfTouched' | 'LimitIfTouched' | 'MarketAsLimit' | 'StopAsLimit' | 'MarketIfTouchedAsLimit'

export const PHEMEXHANDLER_URL: string = 'http://phemexhandler.azurewebsites.net' // 'http://localhost:8085'

// --> MARKET DATA
export async function getMarketData(): Promise<MarketDataResponse> {
    return new Promise((resolve, reject) => {

        const payload = {}
        const token = jwt.sign(payload, secretToken)

        axios.get(`${PHEMEXHANDLER_URL}/marketdata`, getAxiosRequestConfig(token))
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

        axios.get(`${PHEMEXHANDLER_URL}/account`, getAxiosRequestConfig(token))
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

        axios.get(`${PHEMEXHANDLER_URL}/account/openposition`, getAxiosRequestConfig(token))
        .then(res => {
            const position: Position | null = res.data.position
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

        axios.get(`${PHEMEXHANDLER_URL}/account/openorders`, getAxiosRequestConfig(token))
        .then(res => {
            const openOrders: OpenOrder[] = res.data.orders
            resolve(openOrders)
        })
        .catch(err => {
            reject(formatAxiosError(err))
        })

    })
}
export async function getClosedTrades(token: string): Promise<ClosedTradeResponse[]> {
    return new Promise((resolve, reject) => {

        axios.get(`${PHEMEXHANDLER_URL}/account/closedtrades`, getAxiosRequestConfig(token))
        .then(res => {
            const closedTrades: ClosedTradeResponse[] = res.data.trades
            resolve(closedTrades)
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

export async function placeEntryOrder(token: string, price: number, stopLoss: number, side: orderSide, accountPercQty: number): Promise<PlaceEntryResponse> {
    return new Promise((resolve, reject) => {

        const requestOptions: PlaceEntryRequest = {
            price,
            quantity: accountPercQty,
            // orderID: '123',
            stopLoss,
            side
        }

        axios.post(`${PHEMEXHANDLER_URL}/order/placeentry`, requestOptions, getAxiosRequestConfig(token))
        .then(res => {
            const placedentry: PlaceEntryResponse = <PlaceEntryResponse>res.data
            resolve(placedentry)
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

        axios.post(`${PHEMEXHANDLER_URL}/order/placetakeprofit`, requestOptions, getAxiosRequestConfig(token))
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

        axios.post(`${PHEMEXHANDLER_URL}/order/placestoploss`, requestOptions, getAxiosRequestConfig(token))
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


        axios.delete(`${PHEMEXHANDLER_URL}/order/${orderID}`, getAxiosRequestConfig(token))
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

        axios.delete(`${PHEMEXHANDLER_URL}/order/closeall`, getAxiosRequestConfig(token))
        .then(res => {
            resolve(res.data)
        })
        .catch(err => {
            reject(formatAxiosError(err))
        })

    })
}
// <--

