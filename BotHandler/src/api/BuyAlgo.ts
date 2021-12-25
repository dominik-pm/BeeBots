import axios from 'axios'
import { BuyAlgoRequest, BuyAlgoResponse } from '../@types/api/BuyAlgo'
import { formatAxiosError, getAxiosRequestConfig } from './Api'

const URL: string = 'http://buyalgo.azurewebsites.net'

// --> BuyAlgo
export async function getTradeCall(token: string, data: BuyAlgoRequest): Promise<BuyAlgoResponse> {
    return new Promise((resolve, reject) => {

        axios.get(`${URL}/tradecall`, getAxiosRequestConfig(token, data))
        .then(res => {
            resolve(res.data)
        })
        .catch(err => {
            reject(formatAxiosError(err))
        })

    })
}
// <--