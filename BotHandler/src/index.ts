import jwt from 'jsonwebtoken'
import Bot from './bot/Bot'
import dotenv from 'dotenv'
import { getActiveBots } from './api/Api'

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
    // TODO: get marketdata from phemexhandler
    
    bots.forEach(bot => {
        console.log(bot.toString())

        // TODO: check what type the bots is
        // -> TODO: real trading
        //  -> check for open orders and close them
        //  -> check for open positions and give the bot the status of the position
        
        // TODO: periodically send the bot the current marketdata

        // TODO: think of how the bot can call:
        // - openposition
        // - updatestoploss
        // - updatetakeprofit

    })
})