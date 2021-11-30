require('dotenv').config({ path: './variables.env' })

const express = require('express')
const authenticate = require('./middleware/authenticate')
const { logTime, logErr } = require('./middleware/logger')
const { updatePosition } = require('./middleware/positionupdate')
const app = express()

const port = Number(process.argv[2]) || 8088

app.use(express.json())
app.use(logTime)

app.get('/', (req, res) => {
    res.status(200).send({message: 'working'})
})

app.get('/positionupdate', authenticate, updatePosition, (req, res) => {
    const {newStopLoss, newTakeProfit} = req.body.newPosition
    
    if (!newStopLoss || !newTakeProfit) {
        console.error(`newStopLoss: ${newStopLoss}`)
        console.error(`newTakeProfit: ${newTakeProfit}`);
        throw('internal error: no newStopLoss or newTakeProfit')
    }

    let resObj = {
        stopLoss: newStopLoss,
        takeProfit: newTakeProfit
    }

    res.status(200).send(resObj)

})

app.get('/*', (req, res) => {
    throw {status: 404, message: 'Not found'}
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