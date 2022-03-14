// const { getTradeCall, algDataSchema } = require('./algorithm/funding')
const algs = {
    '1': {
        getTradeCall: require('./algorithm/rdm').getTradeCall,
        algDataSchema: require('./algorithm/rdm').algDataSchema
    },
    '2': {
        getTradeCall: require('./algorithm/funding').getTradeCall,
        algDataSchema: require('./algorithm/funding').algDataSchema
    },
    '3': {
        getTradeCall: require('./algorithm/dailyhighlow').getTradeCall,
        algDataSchema: require('./algorithm/dailyhighlow').algDataSchema
    },
    '4': {
        getTradeCall: require('./algorithm/dailyhighlow2').getTradeCall,
        algDataSchema: require('./algorithm/dailyhighlow2').algDataSchema
    }
}

const defaultAlg = algs['2']

function tradeCall(req, res, next) {
    const algo = req.headers['x-algo']

    const { getTradeCall, algDataSchema } = algs[algo] || defaultAlg

    const { value, error, warning } = algDataSchema.validate(req.body, {allowUnknown: true})

    if (warning) {
        console.warn(warning)
    }
    if (error) {
        let errMsg = error.details[0].message.replace('"', '\'').replace('"', '\'')
        throw {status: 400, message: errMsg} // instead of: return res.status(400).send({message: errMsg})
    }

    req.body.tradeCall = getTradeCall(value)
    next()
}

module.exports = {
    tradeCall
}