const Joi = require('joi')

const algDataSchema = Joi.object({
    symbol: Joi.string(),
    indexPrice: Joi.number().greater(0),
    markPrice: Joi.number().greater(0),
    close: Joi.number().greater(0),
    high: Joi.number().greater(0),
    low: Joi.number().greater(0),
    open: Joi.number().greater(0),
    fundingRate: Joi.number(),
    predFundingRate: Joi.number(),
    openInterest: Joi.number(),
    turnover: Joi.number().greater(0),
    volume: Joi.number().greater(0),
    timestamp: Joi.number().unsafe().greater(0),
    currentPrice: Joi.number().greater(0)
})

function getTradeCall(marketData) {
    // const { currentPrice } = marketData
    
    return {
        action: 'Buy',
        confidence: Math.random()
    }
}

module.exports = {
    getTradeCall, algDataSchema
}