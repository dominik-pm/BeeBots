import axios from 'axios'
import { BuyAlgoRequest, BuyAlgoResponse } from '../@types/api/BuyAlgo'
import { formatAxiosError, getAxiosRequestConfig } from './Api'

// --> BuyAlgo
export async function getTradeCall(token: string, data: BuyAlgoRequest): Promise<BuyAlgoResponse> {
    return new Promise((resolve, reject) => {

        axios.get('http://buyalgo.azurewebsites.net/tradecall', getAxiosRequestConfig(token, data))
        .then(res => {
            resolve(res.data)
        })
        .catch(err => {
            reject(formatAxiosError(err))
        })

    })
}
// <--