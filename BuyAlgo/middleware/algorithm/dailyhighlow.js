const Joi = require('joi')

const algDataSchema = Joi.object({
    high: Joi.number().greater(0).required(),
    low: Joi.number().greater(0).required(),
    currentPrice: Joi.number().greater(0).required()
})

// buy when price is closer to daily low
// sell when price is closer to daily high
function getTradeCall(marketData) {
    const { high, low, currentPrice } = marketData

    const lowDist = Math.abs(currentPrice - low)
    const highDist = Math.abs(currentPrice - high)

    let action = 'Buy'
    if (lowDist < highDist) {
        // closer to low
        action = 'Buy'
    } else {
        // closer to high
        action = 'Sell'
    }
    
    const dist = Math.abs(currentPrice - (action == 'Buy' ? low : high))
    const doubleMaxDist = Math.abs(low - high)
    const extraConfidence = 2*(dist/doubleMaxDist)
    
    return {
        action,
        confidence: Math.random()*0.6+extraConfidence*0.4
    }
}

module.exports = {
    getTradeCall, algDataSchema
}