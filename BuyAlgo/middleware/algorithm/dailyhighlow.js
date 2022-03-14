const Joi = require('joi')

const algDataSchema = Joi.object({
    dailyHigh: Joi.number().greater(0),
    dailyLow: Joi.number().greater(0),
    currentPrice: Joi.number().greater(0)
})

// buy when price is closer to daily low
// sell when price is closer to daily high
function getTradeCall(marketData) {
    const { dailyHigh, dailyLow, currentPrice } = marketData

    const lowDist = Math.abs(currentPrice - dailyLow)
    const highDist = Math.abs(currentPrice - dailyHigh)

    let action = 'Buy'
    if (lowDist < highDist) {
        // closer to low
        action = 'Buy'
    } else {
        // closer to high
        action = 'Sell'
    }
    
    const dist = Math.abs(currentPrice - (action == 'Buy' ? dailyLow : dailyHigh))
    const doubleMaxDist = Math.abs(dailyLow - dailyHigh)
    const extraConfidence = 2*(dist/doubleMaxDist)
    
    return {
        action,
        confidence: Math.random()*0.6+extraConfidence*0.4
    }
}

module.exports = {
    getTradeCall, algDataSchema
}