require('dotenv').config({ path: './variables.env' })

const express = require('express')
const Joi = require('joi')
const authenticate = require('./middleware/authenticate')
const {logTime, logErr} = require('./middleware/logger')
const { updatePosition } = require('./middleware/positionupdate')
const app = express()
const port = process.argv[2] || 8088

app.use(express.json()) // parse 
app.use(logTime);

app.get('/positionupdate', authenticate, updatePosition, (req, res) => {
    const {newStopLoss, newTakeProfit} = req.body.newPosition;
    
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

    // console.log(`responding with:`)
    // console.log(resObj)

    res.status(200).send(resObj)

})

app.use(logErr);


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