import Bot from '../bot/Bot'
import jwt from 'jsonwebtoken'
import { secretToken } from '../index'
import { TradingPermission } from '../@types/Bot'


export async function getActiveBots(): Promise<Bot[]> {
    return new Promise((resolve, reject) => {
        let bots: Bot[] = []
        setTimeout(() => { // simulate api request

            // Phemex API Keys (encrypted)
            // TODO: get from backend
            const payload = ({ // (Testnet) -> get from backend (stored in database)
                iv: '29c7b662eb1f8cd11a23cf5728d87973',
                encryptedData: '3e214052222c5a31741c7aff00f09c36609cfdb3ab8d2fe1b4a4038c57f783d6ea6b5dedae765c6f26d8741e6967e7cc34d342c5e8f7b89ed9336736c05209fece70af96860a50e2730b4707c174edf098223c80b944f8b0b3944535011ff60c5f24cd17e13d0edb380a07854bc475f74dce778d12015605ff06907910e804a14667455709c03b3d5666f11c42fb21f32d8708f768009f0d60038391a49ed5aa',
                isLivenet: false
            })
            const authToken = jwt.sign(payload, secretToken)
            let permission: TradingPermission = payload.isLivenet ? 'live' : 'testnet'
            let bot1: Bot = new Bot(authToken, permission, 'Kevin')
            bots.push(bot1)


            const authToken2 = jwt.sign('', secretToken)
            let bot2: Bot = new Bot(authToken2, 'simulated', 'Bertl')
            bots.push(bot2)


            resolve(bots)
        }, 1000)
    })
}
