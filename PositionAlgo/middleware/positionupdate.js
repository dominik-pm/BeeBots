// const { getNewPosition, algDataSchema } = require('../algorithm/3rbe1')
const algs = {
    '1': {
        getNewPosition: require('../algorithm/1raon').getNewPosition,
        algDataSchema: require('../algorithm/1raon').algDataSchema
    },
    '2': {
        getNewPosition: require('../algorithm/2raon').getNewPosition,
        algDataSchema: require('../algorithm/2raon').algDataSchema
    },
    '3': {
        getNewPosition: require('../algorithm/2rbe1').getNewPosition,
        algDataSchema: require('../algorithm/2rbe1').algDataSchema
    },
    '4': {
        getNewPosition: require('../algorithm/3raon').getNewPosition,
        algDataSchema: require('../algorithm/3raon').algDataSchema
    },
    '5': {
        getNewPosition: require('../algorithm/3rbe1').getNewPosition,
        algDataSchema: require('../algorithm/3rbe1').algDataSchema
    }
}

const defaultAlg = algs['2']

function updatePosition(req, res, next) {
    const algo = req.headers['x-algo']

    const { getNewPosition, algDataSchema } = algs[algo] || defaultAlg

    const { value, error, warning } = algDataSchema.validate(req.body, {allowUnknown: true})

    if (warning) {
        console.warn(warning)
    }
    if (error) {
        let errMsg = error.details[0].message.replace('"', '\'').replace('"', '\'')
        throw {status: 400, message: errMsg} // logger takes care of errors -> instead of: return res.status(400).send({message: errMsg})
    }

    req.body.newPosition = getNewPosition(value)
    next()
}

module.exports = {
    updatePosition
}