import dotenv from 'dotenv'
import { getAccountInfo, getActiveBots, getMarketData } from './api/Api'
import Bot from './bot/Bot'
import {TradingPermission} from './@types/Bot'

const DATA_INTERVAL = 10000;

dotenv.config({path: './variables.env'})


console.log('Bot Handler started')


const secret = process.env.ACCESS_TOKEN_SECRET
if (!secret) {
    throw('Could not load access token!')
}
export const secretToken: string = secret;


console.log('fetching active bots...')
getActiveBots()
.then(bots => {
    console.log(`Got ${bots.length} bots!`)

    manageBots(bots)
    setInterval(() => {
        manageBots(bots)
    }, DATA_INTERVAL)
})


function manageBots(bots: Bot[]): void {

    getMarketData()
    .then(data => {
        const { currentPrice, marketData } = data

        console.log(`Got market data!`)
        console.log(`Current Price: ${currentPrice}`)

        bots.forEach(bot => {
            console.log(bot.toString())

            // TODO: check what type the bots is
            if (bot.tradingPermission == 'simulated') {

            } else {
                // -> trading on phemex
                // 1. get account info
                getAccountInfo(bot.authToken)
                .then(data => {
                    console.log(`-> Bot ${bot.name} got account info:`, data)
                    //  -> check for open orders and close them
                    //  -> check for open positions and give the bot the status of the position
                })
                .catch(err => {
                    console.log(err)
                })
            }
    
        })

    })
    .catch(err => {
        console.log(err)
    })

}