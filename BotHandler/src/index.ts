import dotenv from 'dotenv'
import { MarketDataResponse } from './@types/api/PhemexHandler'
import { ActiveTrade, ClosedTrade } from './@types/Bot'
import Bot from './bot/Bot'
import { getActiveBots, saveBotTransaction } from './api/Backend'
import { closeAll, getClosedTrades, getMarketData, getOpenPosition } from './api/PhemexHandler'
import { connectToDatabase } from './database/mongoconnection'

const DATA_INTERVAL = 10000
export let currentMarketData: MarketDataResponse

dotenv.config({path: './variables.env'})


console.log('Bot Handler started')

const secret = process.env.ACCESS_TOKEN_SECRET
if (!secret) {
    throw('Could not load access token!')
}
export const secretToken: string = secret


const connectionString = process.env.MONGO_CONNECTION
if (!connectionString) {
    console.log('Could not load connection string!')
} else {
    connectToDatabase(connectionString)
}


console.log('fetching active bots...')
getActiveBots()
.then(bots => {
    console.log(`Got ${bots.length} bots!`)

    validateBotAccounts(bots.filter(bot => bot.tradingPermission != 'simulated'))

    // manageBots(bots)
    setInterval(() => {
       manageBots(bots)
    }, DATA_INTERVAL)
})
.catch(err => {
    console.log('Cant get active bots:')
    console.log(err)
})

function validateBotAccounts(bots: Bot[]) {

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

            bot.decideAction(currentMarketData)
        })

    })
    .catch(err => {
        console.log('Cant get market data:')
        console.log(err)
    })

}
function checkPosition(bot: Bot, currentPrice: number) {
    if (bot.tradingPermission == 'simulated') {
        // 1. check if bot is in a trade
        if (!bot.currentTrade) return
        if (!bot.currentTrade.stopLoss) throw('Simulated bot does not have a stop loss!')

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
        getOpenPosition(bot.authToken)
        .then(position => {
            // 1. check if bot is in a trade
            if (bot.currentTrade) {
                
                // position is still open -> update values
                if (position) {
                    // send the bot the actual position (doesnt have to differ)
                    bot.currentTrade.stopLoss = position.stopLoss || bot.currentTrade.stopLoss
                    const newPosition: ActiveTrade = {
                        ...bot.currentTrade,
                        takeProfit: position.takeProfit,
                        stopLoss: position.stopLoss || bot.currentTrade.stopLoss
                    }
                    bot.updatedPosition(newPosition)
                }

                // position is closed -> get profit and close the bots position
                else {
                    console.log('Position Closed!')
                    getClosedTrades(bot.authToken)
                    .then(trades => {
                        if (!bot.currentTrade) {
                            console.log('Bot position got removed before being able to calculate the details')
                            return
                        }
                        const entryFill = trades.find(trade => trade.orderID == bot.phemexAccountInfo.entryOrderID)
                        if (!entryFill) {
                            console.log('could not get entry fill order!')
                            return
                        }

                        const closedFills = trades.filter(trade => trade.transactTimeNs > entryFill.transactTimeNs && trade.quantity == entryFill.quantity) // TODO: find on orderID
                        
                        console.log('closed fills:', closedFills)

                        let exitPnl = 0
                        let avgExit = 0
                        closedFills.forEach(trade => {
                            exitPnl += trade.closedPnl - trade.execFee
                            avgExit += trade.execPrice // TODO: price
                        })
                        avgExit /= closedFills.length

                        const netProfit = exitPnl + bot.phemexAccountInfo.entryPnl
                        
                        console.log('pnl: ' + netProfit)

                        // TODO: copy paste code
                        const newTrade = bot.closedPosition(netProfit / bot.phemexAccountInfo.balance, avgExit)

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
                    })
                    .catch(err => {
                        console.log('Can not get Closed Trades')
                        console.log(err)
                    })
                    
                    // bot.closedPosition()
                }
            } 
            // 2. The bot is not in a trade
            else {

                // there is an open position -> check if it is valid and set the bots current trade
                if (position) {
                    console.log('Got position active on phemex!', position)
                    
                    if (position.stopLoss) {
                        // new opened position is valid
                        bot.openedPosition(position.entryPrice, position.side == 'Buy' ? 'long' : 'short', position.stopLoss, position.takeProfit)
                    } else {
                        console.log('New position does not have a Stop Loss!')
                        closeAll(bot.authToken)
                        .then(res => {
                            console.log('Closed position!')
                        })
                        .catch(err => {
                            console.log('Error when trying to close the position!')
                            console.log(err)
                        })
                    }
                } else {
                    if (bot.phemexAccountInfo.activeLimitEntryOrderID) {
                        // bot is waiting for an entry to fill
                        console.log(bot.name + ' wating for entry')
                        
                        // check if it is filled
                        getClosedTrades(bot.authToken)
                        .then(trades => {
                            const filledTrade = trades.find(t => t.orderID == bot.phemexAccountInfo.activeLimitEntryOrderID)
                            if (filledTrade) {
                                // limit is filled
                                bot.phemexAccountInfo.entryOrderID = bot.phemexAccountInfo.activeLimitEntryOrderID
                                bot.phemexAccountInfo.activeLimitEntryOrderID = null
                                console.log(bot.name + ' filled entry at: ' + filledTrade.execPrice)

                                // bot.open position happens next time when scanning for current position on phemex
                            }
                        })
                        .catch(err => {
                            console.log('Cant get closed trades:')
                            console.log(err)
                        })
                    }
                }
            }
        })
        .catch(err => {
            console.log('Error trying to get the open position for bot ' + bot.name)
            console.log(err)
        })
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

    const newTrade = bot.closedPosition(rProfit/**bot.riskProfile.capitalRiskPerTrade*/, closedTrade.exitPrice)

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