const Joi = require('joi')

const algDataSchema = Joi.object({
})

function getTradeCall(req) {
    const {currentPrice, marketData} = req;
    
    return {
        action: 'Buy',
        confidence: Math.random()
    }
}

module.exports = {
    getTradeCall, algDataSchema
}