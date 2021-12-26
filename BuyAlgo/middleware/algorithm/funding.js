const Joi = require('joi')

const algDataSchema = Joi.object({
    symbol: Joi.string(),
    indexPrice: Joi.number().greater(0),
    markPrice: Joi.number().greater(0),
    close: Joi.number().greater(0),
    high: Joi.number().greater(0),
    low: Joi.number().greater(0),
    open: Joi.number().greater(0),
    fundingRate: Joi.number().required(),
    predFundingRate: Joi.number().required(),
    openInterest: Joi.number().required(),
    turnover: Joi.number().greater(0).required(),
    volume: Joi.number().greater(0),
    timestamp: Joi.number().unsafe().greater(0),
    currentPrice: Joi.number().greater(0)
})

function getTradeCall(marketData) {
    const { fundingRate, predFundingRate, openInterest, turnover } = marketData

    let action = 'Buy'
    
    if (fundingRate > 0) {
        // longs pay shorts -> go short
        action = 'Sell'
    } else {
        // shorts pay longs -> go long
    }
    
    const maxFunding = 0.00375
    const extraConfidence = Math.abs(fundingRate / maxFunding)
    
    return {
        action,
        confidence: Math.random()*0.9+extraConfidence*0.1
    }
}

module.exports = {
    getTradeCall, algDataSchema
}