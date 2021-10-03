const express = require('express')
const Joi = require('joi')
const { currentTime } = require('./helpers/helperFunctions')
const { updatePosition, algDataSchema } = require('./algorithm/3rbe1')
const app = express()
const port = 8088

app.use(express.json())

app.get('/positionupdate', (req, res) => {
    console.log(`Positionupdate requested at ${currentTime()}!`);

    const {value, error, warning} = algDataSchema.validate(req.body, {allowUnknown: true})
    console.log(value);

    if (warning) {
        console.warn(warning);
    }
    if (error) {
        let errMsg = error.details[0].message.replace('"', '\'').replace('"', '\'')
        throw {status: 441, message: errMsg} // instead of: return res.status(441).send({message: errMsg})
    }

    const {newStopLoss, newTakeProfit} = updatePosition(req.body)
    
    if (!newStopLoss || !newTakeProfit) {
        console.error(`newStopLoss: ${newStopLoss}`);
        console.error(`newTakeProfit: ${newTakeProfit}`);
        throw('internal error: no newStopLoss or newTakeProfit')
        // console.log('internal error: no newStopLoss or newTakeProfit');
        // return res.status(541).send({message: `internal server error!`})
    }

    let resObj = {
        stopLoss: newStopLoss,
        takeProfit: newTakeProfit
    }

    console.log(`responding with:`)
    console.log(resObj)

    res.status(200).send(resObj)

})

app.use(function(err, req, res, next) {
    // expected error (400)
    if (err.status) {
        console.log(err.message)
        res.status(err.status).json({status: err.status, message: err.message})
    } 
    // unexpected error (500)
    else {
        console.error(err);
        res.status(540).json({message: 'internal server error'})
    }
})

// when running tests, dont start a server (testscript already does)
if (process.env.NODE_ENV != 'test') {

    let server = app.listen(port, () => {
        let host = server.address().address
        host = host == '::' ? 'localhost' : host
        let port = server.address().port

        console.log(`PositionAlgo running at http://${host}:${port}!`)
    })

}

module.exports = app