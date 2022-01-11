/*
    POSITION ALGORITHM:
    -- 2RAON --

    DESCRIPTION:
    takeProfit is always the twice the distance as the stoploss is from the entry price
    stopLoss always stays the same
*/

const Joi = require('joi')
const RDistance = 2;

const algDataSchema = Joi.object({
    entryPrice: Joi.number().greater(0).required(),
    originalStopLoss: Joi.number().greater(0).required()
})

function updatePosition(data) {
    const { entryPrice, originalStopLoss } = data;
    
    let stopDistance = entryPrice-originalStopLoss;
    
    // always set TP at 2R
    let newTakeProfit = entryPrice + (RDistance*stopDistance);

    let newPosition = {
        newStopLoss: originalStopLoss, newTakeProfit
    }

    return newPosition;
}

module.exports = {
    updatePosition, algDataSchema
};