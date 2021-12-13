import dotenv from 'dotenv'
import { MarketData } from './@types/api/PhemexHandler'
import { getActiveBots, getMarketData } from './api/Api'
import Bot from './bot/Bot'

const DATA_INTERVAL = 10000
export let currentMarketData: MarketData;

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

function validateBotAccounts() {
    // -> trading on phemex
    // 1. get account info
    // getAccountInfo(bot.authToken) // is stuck -> no response
    // .then(data => {
        // console.log(`-> Bot ${bot.name} got account info:`, data)
        //  -> check for open orders and close them
        //  -> check for open positions and give the bot the status of the position
    // })
    // .catch(err => {
        // console.log(err)
    // })
}


function manageBots(bots: Bot[]): void {

    getMarketData()
    .then(data => {
        currentMarketData = data
        const { currentPrice, marketData } = currentMarketData

        console.log(`Got market data!`)
        console.log(`Current Price: ${currentPrice}`)

        bots.forEach(bot => {
            console.log(bot.toString())

            // TODO: check what type the bots is
            bot.decideAction(data)

            if (bot.tradingPermission == 'simulated') {
                // 1. check if bot is in a trade
                if (!bot.currentTrade) return

                if (bot.currentTrade.side == 'long') {
                    
                    // -> check if stoploss is hit
                    if (currentPrice <= bot.currentTrade.stopLoss) {
                        botHitStopLoss(bot, bot.currentTrade.stopLoss)
                        return
                    }

                    // -> check if takeprofit is hit
                    if (!bot.currentTrade.takeProfit) return
                    if (currentPrice > bot.currentTrade.takeProfit) {
                        botHitTakeProfit(bot, bot.currentTrade.takeProfit)
                        return
                    }

                } else if (bot.currentTrade.side == 'short') {
                    if (currentPrice >= bot.currentTrade.stopLoss) {
                        botHitStopLoss(bot, bot.currentTrade.stopLoss)
                        return
                    }

                    if (!bot.currentTrade.takeProfit) return
                    if (currentPrice < bot.currentTrade.takeProfit) {
                        botHitTakeProfit(bot, bot.currentTrade.takeProfit)
                        return
                    }

                }
                
                // 2. calculate the trade profit and call bot.closedPosition


            } else {
                // TODO:
                console.log(`API Trading not implemented`)
                // 1. check if the trade is still open
                // 2. if not -> get the trade result
            }
    
        })

    })
    .catch(err => {
        console.log(err)
    })

}

function botHitStopLoss(bot: Bot, exitPrice: number) {   
    console.log(`${bot.name} hit the stoploss at ${exitPrice}!`)

    const profit = -1

    bot.closedPosition(profit, exitPrice)

    console.log(`${bot.name} trade history: `)
    console.log(bot.tradeHistory)
}
function botHitTakeProfit(bot: Bot, exitPrice: number) {
    console.log(`${bot.name} hit the takeprofit at ${exitPrice}}!`)

    const profit = 2

    bot.closedPosition(profit, exitPrice)

    console.log(`${bot.name} trade history: `)
    console.log(bot.tradeHistory)
}