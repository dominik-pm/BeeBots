const { getTradeCall, algDataSchema } = require('./algorithm/rdm')

function tradeCall(req, res, next) {
    const {value, error, warning} = algDataSchema.validate(req.body, {allowUnknown: true})

    if (warning) {
        console.warn(warning);
    }
    if (error) {
        let errMsg = error.details[0].message.replace('"', '\'').replace('"', '\'')
        throw {status: 400, message: errMsg} // instead of: return res.status(400).send({message: errMsg})
    }

    req.body.tradeCall = getTradeCall(value);
    next();
}

module.exports = {
    tradeCall
}