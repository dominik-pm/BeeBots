import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { BACKEND_URL } from './Backend'
import { BUYALGO_URL } from './BuyAlgo'
import { PHEMEXHANDLER_URL } from './PhemexHandler'
import { POSITIONALGO_URL } from './PositionAlgo'

export interface ServiceWorkingResponse {
    message: string
}

export async function checkForBrokenServiceConnections() {
    console.log('checking if every service is running...')
    await checkServiceWorking(POSITIONALGO_URL).then(msg => console.log('PositionAlgo:', msg)).catch(err => {throw{msg:'Could not establish connection to positionalgo!', error: err}})
    await checkServiceWorking(PHEMEXHANDLER_URL).then(msg => console.log('PhemexHandler:', msg)).catch(err => {throw{msg:'Could not establish connection to phemexhandler!', error: err}})
    await checkServiceWorking(BUYALGO_URL).then(msg => console.log('BuyAlgo:', msg)).catch(err => console.log('Could not establish connection to buyalgo', err))
    // checkServiceWorking(BACKEND_URL).then(msg => console.log('Backend:', msg)).catch(err => console.log('Could not establish connection to backend', err))
}

export function checkServiceWorking(url: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        axios.get(`${url}`, getAxiosRequestConfig('', {}))
        .then(res => {
            const { message } = <ServiceWorkingResponse>res.data
            resolve(message)
        })
        .catch(err => {
            reject('err')
        })
    })
}

export function formatAxiosError(err: AxiosError) {
    if (err.response) {
        console.log('Response Http Status: ', err.response.status)
        console.log('Response Headers: ', err.response.headers);
        return err.response.data
    } else if (err.request) {
        return err.request
    } else {
        return err.message
    }
}

export function getAxiosRequestConfig(token: string, data: any = null, customHeader: any = null): AxiosRequestConfig {
    const bearerAuth = {
        'Authorization': `Bearer ${token}`
    }

    let headers = bearerAuth
    if (customHeader != null) {
        headers = customHeader
    }

    const config: AxiosRequestConfig = {
        headers: headers,
        data: data
    }
    return config
}