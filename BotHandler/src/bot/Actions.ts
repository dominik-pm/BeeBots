import { currentMarketData } from '..'
import Bot from './Bot'

export function openPosition(bot: Bot, action: 'Buy' | 'Sell') {
    console.log(`Bot ${bot.name} wants to open a trade`)
    if (bot.tradingPermission == 'simulated') {
        bot.openedPosition(currentMarketData.currentPrice, action == 'Buy' ? 'long' : 'short', 1000)
    } else {
        // TODO: API Request to phemex handler
    }
}

export function updateStopLoss(bot: Bot) {
    console.log(`Bot ${bot.name} wants to update his stoploss`)
}

export function updateTakeProfit(bot: Bot) {
    console.log(`Bot ${bot.name} wants to update his takeprofit`)
}
