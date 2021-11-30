require('dotenv').config({ path: './variables.env' })

const express = require('express')
const authenticate = require('./middleware/authenticate')
const { logTime, logErr } = require('./middleware/logger')
const { tradeCall } = require('./middleware/tradecall')
const app = express()
const port = Number(process.argv[2]) || 8087

app.use(express.json())
app.use(logTime);

app.get('/', (req, res) => {
    res.status(200).send({message: 'working'})
})

app.get('/tradecall', tradeCall, authenticate, (req, res) => {
    const {action, confidence} = req.body.tradeCall;

    if (!action || !confidence) {
        console.log(`action: ${action}`);
        console.log(`confidence: ${confidence}`);
        throw('internal error: no action or confidence');
    }

    let resObj = {
        action,
        confidence
    }

    res.status(200).send(resObj)
});

app.get('/*', (req, res) => {
    throw {status: 404, message: 'Not found'}
})

app.use(logErr);

// when running tests, dont start a server (testscript already does)
if (process.env.NODE_ENV != 'test') {

    app.listen(port, () => {
        console.log(`BuyAlgo running at localhost:${port}!`);
    })

}

module.exports = app // for tests