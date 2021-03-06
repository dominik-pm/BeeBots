import dotenv from 'dotenv'
import { MarketDataResponse } from './@types/api/PhemexHandler'
import { ActiveTrade, ClosedTrade } from './@types/Bot'
import Bot from './bot/Bot'
import { getActiveBots, saveBotTransaction } from './api/Backend'
import { closeAll, getAccountInfo, getClosedTrades, getMarketData, getOpenPosition } from './api/PhemexHandler'
import { connectToDatabase, saveCurrentPrice } from './database/mongoconnection'
import { btcAmountToEvAmount, evAmountToBTCAmount } from './helper'
import { checkForBrokenServiceConnections } from './api/Api'
import express from 'express'

const PORT = process.env.PORT || 3000
const app = express()
app.get('/', (req, res) => {
    res.send('BotHandler running')
})
app.listen(PORT, () => {
    console.log(`BotHandler webservice running at localhost:${PORT}!`)
})

const LOG_TO_FILE = false

console.log('Bot Handler starting...')

// redirect console logs to file system
var fs = require('fs')
var util = require('util')
const logStreamPath = __dirname + '/debug.log'
try {
    if (fs.existsSync(logStreamPath)) {
        fs.unlinkSync(logStreamPath)
    }
} catch (err) {
    // file does not exists
}
var log_file = fs.createWriteStream(logStreamPath, {flags : 'w'})

if (LOG_TO_FILE) {
    console.log = function(d) {
        log_file.write(util.format(d) + '\n')
    }
    console.log('starting new log stream...')
    console.log(new Date().toISOString())
}


const DATA_INTERVAL = 10000
export let currentMarketData: MarketDataResponse

dotenv.config({path: './variables.env'})

console.log('Bot Handler started')

const secret = process.env.ACCESS_TOKEN_SECRET
if (!secret) {
    throw('Could not load access token!')
}
export const secretToken: string = secret

const backendToken = process.env.BACKEND_TOKEN
if (!backendToken) {
    throw('Could not load backend token!')
}
export const backendAuthToken: string = backendToken

const connectionString = process.env.MONGO_CONNECTION
if (!connectionString) {
    console.log('Could not load connection string!')
} else {
    connectToDatabase(connectionString)
}

startBotHandler()

async function startBotHandler() {
    //await checkForBrokenServiceConnections()

    console.log('fetching active bots...')
    getActiveBots()
    .then(bots => {
        console.log(`Got ${bots.length} bots!`)
        console.log(bots)
    
        validateBotAccounts(bots.filter(bot => bot.tradingPermission != 'simulated'))
    
        setInterval(() => {

            getActiveBots()
            .then(newBots => {
                let botsToAdd: Bot[] = []
                newBots.forEach(newBot => {
                    const botIds = bots.map(b => b.id)
                    if (!botIds.includes(newBot.id)) {
                        // newBot is actually a new bot!
                        console.log('Bothandler found a new Bot!')
                        botsToAdd.push(newBot)    
                    }
                })

                if (botsToAdd.length > 0) {
                    console.log('found new bots in the database:')
                    console.log(botsToAdd)
                }
                // append all bots to add to the current bot list
                botsToAdd.forEach(newBot => {
                    bots.push(newBot)
                })
            })
            .catch(err => {
                console.log(err)
            })


            getMarketData()
            .then(data => {
                currentMarketData = data
                saveCurrentPrice(currentMarketData.currentPrice)

                manageBots(bots)

            })
            .catch(err => {
                console.log('Cant get market data:')
                console.log(err)
            })

        }, DATA_INTERVAL)
    })
    .catch(err => {
        console.log('Cant get active bots:')
        console.log(err)
    })
}



function validateBotAccounts(bots: Bot[]) {

    // -> trading on phemex
    // 1. get account info
    bots.forEach(bot => {

        setBotBalance(bot)

    })
    
    //console.log(bot.toString())

}


function manageBots(bots: Bot[]): void {

    const { currentPrice } = currentMarketData

    console.log(`Got market data!`)
    console.log(`Current Price: ${currentPrice}`)

    saveCurrentPrice(currentPrice)

    bots.forEach(bot => {
        checkPosition(bot, currentPrice) // TODO: call this with every network price stream input

        bot.decideAction(currentMarketData)
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
                    bot.currentTrade.stopLoss = position.stopLoss
                    const newPosition: ActiveTrade = {
                        ...bot.currentTrade,
                        takeProfit: position.takeProfit,
                        stopLoss: position.stopLoss
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
                        console.log('entry order id: ' + bot.phemexAccountInfo.entryOrderID)
                        const entryFills = trades.filter(trade => trade.orderID == bot.phemexAccountInfo.entryOrderID)
                        if (entryFills.length == 0) {
                            console.log('could not get entry fill orders!')
                            return
                        }
                        // TODO: kinda weird (if entry is a market -> can be split to multiple order (they still have the same orderID though))
                        let entryFill = entryFills[0]
                        entryFills.forEach((fill, index) => {
                            if (index > 0) {
                                entryFill.quantity += fill.quantity
                            }
                        })
                        console.log('entry pnl: ' + bot.phemexAccountInfo.entryPnl)


                        console.log(entryFill)
                        console.log(trades[0])
                        const closedFills = trades.filter(trade => trade.transactTimeNs > entryFill.transactTimeNs && trade.quantity == entryFill.quantity)
                        
                        console.log('closed fills:', closedFills.filter((v, i) => i < 3))

                        if (closedFills.length == 0) {
                            console.log('could not get closed fill orders!')
                            // return
                            closedFills.push(trades[0])
                            console.log('closed fills (appended last trade): ', closedFills.filter((v, i) => i < 3))
                        }

                        let exitPnl = 0
                        let exitFee = 0
                        let avgExit = 0
                        closedFills.forEach(trade => {
                            exitPnl += trade.closedPnl
                            exitFee += trade.execFee
                            avgExit += (trade.execPrice * trade.execQty)
                        })
                        avgExit /= entryFill.quantity

                        console.log('exit pnl: ' + exitPnl)
                        console.log('exit fee: ' + exitFee)


                        const netProfit = evAmountToBTCAmount(Math.round(btcAmountToEvAmount(exitPnl - exitFee + bot.phemexAccountInfo.entryPnl)))
                        
                        const percProfit = netProfit / bot.phemexAccountInfo.balance

                        const risk = bot.phemexAccountInfo.balance * bot.riskProfile.capitalRiskPerTrade
                        const rProfit = netProfit / risk

                        console.log(`risk: ${risk}`)
                        console.log('pnl: ' + netProfit)
                        console.log(`percentage gain: ${Math.round(percProfit*10000)/100}`)
                        console.log(`r-profit: ${rProfit}`)

                        // TODO: copy paste code
                        const newTrade = bot.closedPosition(percProfit, rProfit, avgExit)

                        console.log(`${bot.name} trade history: `)
                        console.log(bot.tradeHistory.filter((t, i) => i >= bot.tradeHistory.length - 3))

                        setBotBalance(bot)
                    
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
                    
                }
            } 
            // 2. The bot is not in a trade
            else {

                // there is an open position -> check if it is valid and set the bots current trade
                if (position) {
                    console.log('Got position active on phemex!', position)
                    
                    if (position.stopLoss) {
                        // new opened position is valid

                        // check if it is filled
                        getClosedTrades(bot.authToken)
                        .then(trades => {
                            if (!position.stopLoss) {
                                console.log('Postion stop loss got removed!')
                                // TODO: set stoploss
                                closeAll(bot.authToken)
                                .then(res => {
                                    console.log('Closed all trades!')
                                    console.log(res)
                                })
                                .catch(err => {
                                    console.log('Cant close all trades')
                                    console.log(err)
                                })
                                return
                            }

                            const filledTrade = trades.find(t => t.orderID == bot.phemexAccountInfo.activeLimitEntryOrderID)
                            if (filledTrade) {
                                // limit is filled
                                bot.phemexAccountInfo.entryPnl = filledTrade.closedPnl-filledTrade.execFee
                                bot.phemexAccountInfo.entryOrderID = filledTrade.orderID
                                bot.phemexAccountInfo.activeLimitEntryOrderID = null
                                console.log(bot.name + ' filled entry at: ' + filledTrade.execPrice)
                                console.log('filled order: ' + filledTrade.orderID)
                            } else {
                                // order has not just been filled -> maybe bothandler restarted and position was open
                                const activeFill = trades.find(t => t.side == position.side && t.quantity == position.quantity)
                                if (!activeFill) {
                                    console.log('Cant get active previously filled position!')
                                    return
                                }
                                bot.phemexAccountInfo.entryPnl = activeFill.closedPnl-activeFill.execFee
                                bot.phemexAccountInfo.entryOrderID = activeFill.orderID
                                bot.phemexAccountInfo.activeLimitEntryOrderID = null
                                console.log('previously filled order: ' + activeFill.orderID)
                            }
                            bot.openedPosition(position.entryPrice, position.side == 'Buy' ? 'long' : 'short', position.stopLoss, position.takeProfit)
                        })
                        .catch(err => {
                            console.log('Cant get closed trades:')
                            console.log(err)
                        })

                    } else {
                        console.log('New position does not have a Stop Loss!')
                        // TODO: set stoploss
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
                    } else {
                        // TODO: maybe kill all orders (not waiting for entry, just idling)
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

function setBotBalance(bot: Bot) {
    getAccountInfo(bot.authToken)
    .then(data => {
        console.log(`-> Bot ${bot.name} got account info:`, data)
        bot.phemexAccountInfo.balance = data.btcBalance
    })
    .catch(err => {
        console.log(`Could not get account info for bot: ${bot.name}!`)
        console.log(err)
    })
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
    const percProfit = bot.riskProfile.capitalRiskPerTrade * rProfit

    const newTrade = bot.closedPosition(percProfit, rProfit, closedTrade.exitPrice)

    console.log(`${bot.name} trade history: `)
    console.log(bot.tradeHistory.filter((t, i) => i >= bot.tradeHistory.length - 3))

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