/*
    POSITION ALGORITHM:
    -- 1RAON --

    DESCRIPTION:
    takeProfit is always the same distance as the stoploss is from the entry price
    stopLoss always stays the same
*/

const Joi = require('joi')
const RDistance = 1;

const algDataSchema = Joi.object({
    entryPrice: Joi.number().greater(0).required(),
    stopLoss: Joi.number().greater(0).required()
})

function updatePosition(data) {
    const { entryPrice, stopLoss } = data;
    
    let stopDistance = entryPrice-stopLoss;

    // always set TP at 1R
    let newTakeProfit = entryPrice + (RDistance*stopDistance);

    let newPosition = {
        newStopLoss: stopLoss, newTakeProfit
    }

    return newPosition;
}

module.exports = {
    updatePosition, algDataSchema
};