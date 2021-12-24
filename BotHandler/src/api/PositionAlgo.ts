import axios from 'axios'
import { PositionAlgoRequest, PositionAlgoResponse } from '../@types/api/PositionAlgo'
import { ActiveTrade } from '../@types/Bot'
import { formatPrice } from '../helper'
import { formatAxiosError, getAxiosRequestConfig } from './Api'

// --> PositionAlgo
export async function getPositionUpdate(token: string, trade: ActiveTrade, currentPrice: number): Promise<PositionAlgoResponse> {
    return new Promise((resolve, reject) => {

        const data: PositionAlgoRequest = {
            entryPrice: trade.entryPrice,
            originalStopLoss: trade.originalStopLoss,
            stopLoss: trade.stopLoss,
            takeProfit: trade.takeProfit,
            currentPrice
        }

        axios.get('http://positionalgo.azurewebsites.net/positionupdate', getAxiosRequestConfig(token, data))
        .then(res => {
            let pos = <PositionAlgoResponse>res.data

            const newPosition: PositionAlgoResponse = {
                stopLoss: formatPrice(pos.stopLoss),
                takeProfit: formatPrice(pos.takeProfit)
            }
            resolve(newPosition)
        })
        .catch(err => {
            reject(formatAxiosError(err))
        })

    })
}
// <--