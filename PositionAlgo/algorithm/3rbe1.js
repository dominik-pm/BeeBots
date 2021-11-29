/*
    POSITION ALGORITHM:
    -- 3RBE1 --

    DESCRIPTION:
    takeProfit is always three times the distance as the stoploss is from the entry price
    stopLoss will be set to break even,
     when the currentPrice is the same distance from the entry price as the stopLoss is
*/

const Joi = require('joi')
const RDistance = 3;

const algDataSchema = Joi.object({
    currentPrice: Joi.number().greater(0).required(),
    entryPrice: Joi.number().greater(0).required(),
    stopLoss: Joi.number().greater(0).required(),
    originalStopLoss: Joi.number().greater(0).required(),
    takeProfit: [Joi.number().greater(0), Joi.allow(null)]
})

function getNewPosition(data) {
    const { currentPrice, entryPrice, stopLoss, originalStopLoss, takeProfit } = data;

    let newTakeProfit = takeProfit;
    let newStopLoss = stopLoss;
    let stopDistance = entryPrice-originalStopLoss;
    
    // always set TP at 3R
    newTakeProfit = entryPrice + (RDistance*stopDistance);

    // set SL to BE, if price is at 1R
    if (originalStopLoss <= entryPrice) {
        // -> long
        if (currentPrice >= entryPrice + stopDistance) {
            newStopLoss = entryPrice;
        }
    } else {
        // -> short
        if (currentPrice <= entryPrice + stopDistance) {
            newStopLoss = entryPrice;
        }
    }

    let newPosition = {
        newStopLoss, newTakeProfit
    }

    return newPosition;
}

module.exports = {
    getNewPosition, algDataSchema
};