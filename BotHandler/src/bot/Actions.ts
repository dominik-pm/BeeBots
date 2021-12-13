import { currentMarketData } from '..'
import { ActiveTrade } from '../@types/Bot'
import { formatPrice } from '../helper'
import Bot from './Bot'

export function openPosition(bot: Bot, action: 'Buy' | 'Sell', stopDistancePercentage: number) {
    console.log(`Bot ${bot.name} wants to open a trade`)

    const stopDistance: number = currentMarketData.currentPrice * stopDistancePercentage
    const stopLoss: number = formatPrice(currentMarketData.currentPrice + (stopDistance * (action == 'Buy' ? (-1) : 1)))

    if (bot.tradingPermission == 'simulated') {
        console.log(`opened trade at: ${currentMarketData.currentPrice}`)
        bot.openedPosition(currentMarketData.currentPrice, action == 'Buy' ? 'long' : 'short', stopLoss)
    } else {
        // TODO: API Request to phemex handler
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
        console.log(`Updating the stoploss on the phemex api not implemented!`)
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
        console.log(`Updating the takeprofit on the phemex api not implemented!`)
    }
}
