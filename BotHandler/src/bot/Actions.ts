import Bot from './Bot'

export function openPosition(bot: Bot) {
    console.log(`Bot ${bot.name} wants to open a trade`)
}

export function updateStopLoss(bot: Bot) {
    console.log(`Bot ${bot.name} wants to update his stoploss`)
}

export function updateTakeProfit(bot: Bot) {
    console.log(`Bot ${bot.name} wants to update his takeprofit`)
}
