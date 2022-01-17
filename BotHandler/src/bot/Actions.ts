import { currentMarketData } from '..'
import { ActiveTrade } from '../@types/Bot'
import { orderSide, placeEntryOrder, placeStopLoss, placeTakeProfit } from '../api/PhemexHandler'
import { formatPrice } from '../helper'
import Bot from './Bot'

export function openPosition(bot: Bot, action: orderSide, stopDistancePercentage: number) {
    console.log(`Bot ${bot.name} wants to open ${action == 'Buy' ? 'long' : 'short'} trade`)

    if (bot.tradingPermission == 'simulated') {
        console.log(`opened trade at: ${currentMarketData.currentPrice}`)

        const stopDistance: number = currentMarketData.currentPrice * stopDistancePercentage
        const stopLoss: number = formatPrice(currentMarketData.currentPrice + (stopDistance * (action == 'Buy' ? (-1) : 1)))
        bot.openedPosition(currentMarketData.currentPrice, action == 'Buy' ? 'long' : 'short', stopLoss)
    } else {
        const percEntryDist: number = 0.0002 // TODO: (maybe daily volatility / 100 or sth like that)
        const entryDistance: number = (action == 'Buy' ? 1 : - 1) * currentMarketData.currentPrice * percEntryDist
        const openPrice = currentMarketData.currentPrice - entryDistance
        const stopDistance: number = openPrice * stopDistancePercentage // TODO: get this from bot
        const stopLoss: number = formatPrice(openPrice + (stopDistance * (action == 'Buy' ? (-1) : 1)))


        placeEntryOrder(bot.authToken, openPrice, stopLoss, action, bot.riskProfile.capitalRiskPerTrade)
        .then(entry => {
            console.log(entry.message)
            const entryOrderID = entry.orderID
            console.log(entryOrderID)
            bot.phemexAccountInfo.activeLimitEntryOrderID = entryOrderID
        })
        .catch(err => {
            console.log(err)
        })
    }
}

export function updateStopLoss(bot: Bot, currentTrade: ActiveTrade, newStopLoss: number) {
    console.log(`Bot ${bot.name} wants to update his stoploss to ${newStopLoss}`)
    if (bot.tradingPermission == 'simulated') {
        const newPosition: ActiveTrade = {
            ...currentTrade,
            stopLoss: newStopLoss
        }
        bot.updatedPosition(newPosition)
    } else {
        // console.log(`Updating the stoploss on the phemex api not implemented!`)
        placeStopLoss(bot.authToken, newStopLoss)
        .then(createdOrder => {
            console.log(createdOrder.message)
            const newPosition: ActiveTrade = {
                ...currentTrade,
                stopLoss: newStopLoss
            }
            bot.updatedPosition(newPosition)
        })
        .catch(err => {
            console.log(err)
        })
    }
}

export function updateTakeProfit(bot: Bot, currentTrade: ActiveTrade, newTakeProfit: number) {
    console.log(`Bot ${bot.name} wants to update his takeprofit to ${newTakeProfit}`)
    if (bot.tradingPermission == 'simulated') {
        const newPosition: ActiveTrade = {
            ...currentTrade,
            takeProfit: newTakeProfit
        }
        bot.updatedPosition(newPosition)
    } else {
        // console.log(`Updating the takeprofit on the phemex api not implemented!`)
        placeTakeProfit(bot.authToken, newTakeProfit)
        .then(createdOrder => {
            console.log(createdOrder.message)
            const newPosition: ActiveTrade = {
                ...currentTrade,
                takeProfit: newTakeProfit
            }
            bot.updatedPosition(newPosition)
        })
        .catch(err => {
            console.log(err)
        })
    }
}
