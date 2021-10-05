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
    stopLoss: Joi.number().greater(0).required()
})

function updatePosition(data) {
    const { entryPrice, stopLoss } = data;
    
    let stopDistance = entryPrice-stopLoss;
    
    // always set TP at 2R
    let newTakeProfit = entryPrice + (RDistance*stopDistance);

    let newPosition = {
        newStopLoss: stopLoss, newTakeProfit
    }

    return newPosition;
}

module.exports = {
    updatePosition, algDataSchema
};