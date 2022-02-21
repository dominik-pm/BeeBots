import axios, { AxiosRequestConfig } from 'axios'
import jwt from 'jsonwebtoken'
import { backendAuthToken, secretToken } from '..'
import { BackendBotResponse } from '../@types/api/Backend'
import { RiskProfile, TradingPermission, Transaction } from '../@types/Bot'
import Bot from '../bot/Bot'
import { formatAxiosError, getAxiosRequestConfig } from './Api'


export const BACKEND_URL: string = `http://beebotsbackend.azurewebsites.net/api`

// --> BACKEND
export async function getActiveBots(): Promise<Bot[]> {
    return new Promise((resolve, reject) => {

        const token = jwt.sign('-', secretToken)

        axios.get(`${BACKEND_URL}/bots`, getAxiosRequestConfig(token, null, {'x-functions-key': backendAuthToken}))
        .then(res => {
            console.log('backend bot result:')
            const botData: BackendBotResponse[] = res.data
            console.log(botData)
            let bots: Bot[] = []

            botData.forEach(b => {
                // Phemex API Keys (encrypted)
                const payload = ({ // (Testnet) -> get from backend (stored in database)
                    iv: b.encryptedApisecret,
                    encryptedData: b.encryptedApikey,
                    isLivenet: false
                })
                const authToken = jwt.sign(payload, secretToken)

                const permission: TradingPermission = payload.isLivenet ? 'live' : 'testnet'
                const risk: RiskProfile = {
                    capitalRiskPerTrade: 0.001,
                    stopLossDistance: 0.001,
                    tradeThreshhold: 0.75
                } 
                let newBot: Bot = new Bot(b.botsId, authToken, permission, b.name, b.buyAlgo, b.positionAlgo, risk)
                bots.push(newBot)

                const testTrade: Transaction = {
                    action: 'long',
                    entryPrice: 69420,
                    exitPrice: 70069,
                    exitTime: new Date().toISOString(),
                    percentageProfit: 0.01,
                    profit: 2,
                    stopLoss: 69420-(649*2),
                    target: 70069
                }
                saveBotTransaction(b.botsId, testTrade, newBot.authToken)
                .then(res => {
                    console.log('saved tx:')
                    console.log(res.data)
                })
                .catch(err => {
                    console.log('Cant save tx to backend:', err)
                })
            })

            resolve(bots)
        })
        .catch(err => {
            console.log(err)
            reject(err)
        })

        // let bots: Bot[] = []

        // setTimeout(() => { // simulate api request

        //     // Phemex API Keys (encrypted)
        //     const payload = ({ // (Testnet) -> get from backend (stored in database)
        //         iv: '29c7b662eb1f8cd11a23cf5728d87973',
        //         encryptedData: '3e214052222c5a31741c7aff00f09c36609cfdb3ab8d2fe1b4a4038c57f783d6ea6b5dedae765c6f26d8741e6967e7cc34d342c5e8f7b89ed9336736c05209fece70af96860a50e2730b4707c174edf098223c80b944f8b0b3944535011ff60c5f24cd17e13d0edb380a07854bc475f74dce778d12015605ff06907910e804a14667455709c03b3d5666f11c42fb21f32d8708f768009f0d60038391a49ed5aa',
        //         isLivenet: false
        //     })
        //     const authToken = jwt.sign(payload, secretToken)

        //     const permission: TradingPermission = payload.isLivenet ? 'live' : 'testnet'
        //     const risk: RiskProfile = {
        //         capitalRiskPerTrade: 0.001,
        //         stopLossDistance: 0.001,
        //         tradeThreshhold: 0.75
        //     } 
        //     let bot1: Bot = new Bot(1, authToken, permission, 'Kevin', risk)
        //     bots.push(bot1)

        //     bot1.authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpdiI6IjI5YzdiNjYyZWIxZjhjZDExYTIzY2Y1NzI4ZDg3OTczIiwiZW5jcnlwdGVkRGF0YSI6IjNlMjE0MDUyMjIyYzVhMzE3NDFjN2FmZjAwZjA5YzM2NjA5Y2ZkYjNhYjhkMmZlMWI0YTQwMzhjNTdmNzgzZDZlYTZiNWRlZGFlNzY1YzZmMjZkODc0MWU2OTY3ZTdjYzM0ZDM0MmM1ZThmN2I4OWVkOTMzNjczNmMwNTIwOWZlY2U3MGFmOTY4NjBhNTBlMjczMGI0NzA3YzE3NGVkZjA5ODIyM2M4MGI5NDRmOGIwYjM5NDQ1MzUwMTFmZjYwYzVmMjRjZDE3ZTEzZDBlZGIzODBhMDc4NTRiYzQ3NWY3NGRjZTc3OGQxMjAxNTYwNWZmMDY5MDc5MTBlODA0YTE0NjY3NDU1NzA5YzAzYjNkNTY2NmYxMWM0MmZiMjFmMzJkODcwOGY3NjgwMDlmMGQ2MDAzODM5MWE0OWVkNWFhIiwiaXNMaXZlbmV0IjpmYWxzZSwiaWF0IjoxNjMzODY4MTY3fQ.vhLoQDbsRZGOtXB1ZA3C7gn5kQGSdEtLfwBdFkuRSto'


        //     // const authToken2 = jwt.sign('nix', secretToken)
        //     // let bot2: Bot = new Bot(2, authToken2, 'simulated', 'Bertl')
        //     // bots.push(bot2)


        //     resolve(bots)
        // }, 1000)
    })
}

export async function saveBotTransaction(botId: number, newTrade: Transaction, token: string): Promise<any> {
    return new Promise((resolve, reject) => {
        // const config: AxiosRequestConfig = getAxiosRequestConfig(token, {
        //     botId,
        //     trade: newTrade
        // }, {'x-functions-key': backendAuthToken})
        const req: any = {
            botId,
            trade: newTrade
        }
        console.log(`posting new trade to backend for bot ${botId}: `, req)

        axios.post(`${BACKEND_URL}/trade`, req, {headers: {'x-functions-key': backendAuthToken}})
        .then(res => {
            resolve(res.data)
        })
        .catch(err => {
            reject(formatAxiosError(err))
        })

    })
}
// <--