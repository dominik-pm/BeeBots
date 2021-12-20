import dotenv from 'dotenv'
import { MarketData } from './@types/api/PhemexHandler'
import { ActiveTrade, ClosedTrade } from './@types/Bot'
import { getActiveBots, getMarketData, saveBotTransaction } from './api/Api'
import Bot from './bot/Bot'

const DATA_INTERVAL = 10000
export let currentMarketData: MarketData

dotenv.config({path: './variables.env'})


console.log('Bot Handler started')


const secret = process.env.ACCESS_TOKEN_SECRET
if (!secret) {
    throw('Could not load access token!')
}
export const secretToken: string = secret

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
    
    //console.log(bot.toString())

}


function manageBots(bots: Bot[]): void {

    getMarketData()
    .then(data => {
        currentMarketData = data
        const { currentPrice, marketData } = currentMarketData

        console.log(`Got market data!`)
        console.log(`Current Price: ${currentPrice}`)

        bots.forEach(bot => {
            checkPosition(bot, currentPrice) // TODO: call this with every network price stream input

            bot.decideAction(data)
        })

    })
    .catch(err => {
        console.log(err)
    })

}
function checkPosition(bot: Bot, currentPrice: number) {
    if (bot.tradingPermission == 'simulated') {
        // 1. check if bot is in a trade
        if (!bot.currentTrade) return

        if (bot.currentTrade.side == 'long') {
            
            // -> check if stoploss is hit
            if (currentPrice <= bot.currentTrade.stopLoss) {
                botHitStopLoss(bot, bot.currentTrade)
                return
            }

            // -> check if takeprofit is hit
            if (!bot.currentTrade.takeProfit) return
            if (currentPrice > bot.currentTrade.takeProfit) {
                botHitTakeProfit(bot, bot.currentTrade)
                return
            }

        } else if (bot.currentTrade.side == 'short') {
            if (currentPrice >= bot.currentTrade.stopLoss) {
                botHitStopLoss(bot, bot.currentTrade)
                return
            }

            if (!bot.currentTrade.takeProfit) return
            if (currentPrice < bot.currentTrade.takeProfit) {
                botHitTakeProfit(bot, bot.currentTrade)
                return
            }

        }


    } else {
        // TODO:
        console.log(`API Trading not implemented`)
        // 1. check if the trade is still open
        // 2. if not -> get the trade result
    }
}

function botHitStopLoss(bot: Bot, closedTrade: ActiveTrade) {   
    if (!closedTrade.exitPrice) {
        closedTrade.exitPrice = closedTrade.stopLoss
    }

    console.log(`${bot.name} hit the stoploss at ${closedTrade.exitPrice}!`)

    botClosePosition(bot, <ClosedTrade>closedTrade)
}

function botHitTakeProfit(bot: Bot, activeTrade: ActiveTrade) {
    if (!activeTrade.exitPrice) {
        if (!activeTrade.takeProfit) {
            console.log(`${bot.name} can not hit take profit! no takeProfit or exitPrice specified!`)
            console.log(activeTrade)
            return
        }
        activeTrade.exitPrice = activeTrade.takeProfit
    }

    console.log(`${bot.name} hit the takeprofit at ${activeTrade.exitPrice}}!`)

    botClosePosition(bot, <ClosedTrade>activeTrade)
}

export function getRProfit(entryPrice: number, stopLoss: number, exitPrice: number): number {
    const stopDistance = entryPrice - stopLoss
    const profitDistance = exitPrice - entryPrice
    const rProfit = Math.trunc(Math.round((profitDistance / stopDistance)*100)) / 100

    return rProfit
}

function botClosePosition(bot: Bot, closedTrade: ClosedTrade) {

    const rProfit = getRProfit(closedTrade.entryPrice, closedTrade.originalStopLoss, closedTrade.exitPrice)

    const newTrade = bot.closedPosition(rProfit, closedTrade.exitPrice)

    console.log(`${bot.name} trade history: `)
    console.log(bot.tradeHistory)

    if (newTrade) {
        saveBotTransaction(bot.id, newTrade, bot.authToken)
        .then(res => {
            console.log(`${bot.name}: Successfully saved transaction to the database!`)
            console.log(res)
        })
        .catch(err => {
            console.log(`${bot.name}: Could not save the transaction to the database!`)
            console.log(err)
        })
    }
}