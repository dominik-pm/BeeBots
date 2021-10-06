const { getNewPosition, algDataSchema } = require('../algorithm/3rbe1')

function updatePosition(req, res, next) {
    const {value, error, warning} = algDataSchema.validate(req.body, {allowUnknown: true})

    if (warning) {
        console.warn(warning);
    }
    if (error) {
        let errMsg = error.details[0].message.replace('"', '\'').replace('"', '\'')
        throw {status: 400, message: errMsg} // logger takes care of errors -> instead of: return res.status(400).send({message: errMsg})
    }

    req.body.newPosition = getNewPosition(value);
    next();
}

module.exports = {
    updatePosition
}