import axios from 'axios'
import { BuyAlgoRequest, BuyAlgoResponse } from '../@types/api/BuyAlgo'
import { formatAxiosError, getAxiosRequestConfig } from './Api'

export const BUYALGO_URL: string = 'http://buyalgo.azurewebsites.net' // 'http://localhost:8087'

// --> BuyAlgo
export async function getTradeCall(token: string, data: BuyAlgoRequest, buyAlgo: number): Promise<BuyAlgoResponse> {
    return new Promise((resolve, reject) => {

        console.log('buyalgo req')
        axios.defaults.headers.common['x-algo'] = buyAlgo.toString()
        axios.get(`${BUYALGO_URL}/tradecall`, getAxiosRequestConfig(token, data))
        .then(res => {
            resolve(res.data)
        })
        .catch(err => {
            reject(err)
        })

    })
}
// <--