/*
    POSITION ALGORITHM:
    -- 3RAON --

    DESCRIPTION:
    takeProfit is always three times the distance as the stoploss is from the entry price
    stopLoss always stays the same
*/

const Joi = require('joi')
const RDistance = 3;

const algDataSchema = Joi.object({
    entryPrice: Joi.number().greater(0).required(),
    stopLoss: Joi.number().greater(0).required()
})

function updatePosition(req) {
    const { entryPrice, stopLoss } = req;
    
    let stopDistance = entryPrice-stopLoss;
    
    // always set TP at 3R
    let newTakeProfit = entryPrice + (RDistance*stopDistance);

    let newPosition = {
        newStopLoss: stopLoss, newTakeProfit
    }

    return newPosition;
}

module.exports = {
    updatePosition, algDataSchema
};