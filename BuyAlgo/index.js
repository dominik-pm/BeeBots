require('dotenv').config({ path: './variables.env' })

const express = require('express')
const authenticate = require('./middleware/authenticate')
const { logTime, logErr } = require('./middleware/logger')
const { tradeCall } = require('./middleware/tradecall')
const app = express()
const port = process.argv[2] || 8087

app.use(express.json())
app.use(logTime);

app.get('/tradecall', tradeCall, authenticate, (req, res) => {
    const {action, confidence} = req.body.tradeCall;

    if (!action || !confidence) {
        console.log(`action: ${action}`);
        console.log(`confidence: ${confidence}`);
        throw('internal error: no action or confidence');
        // console.log('internal error: no action or confidence');
        // res.status(531).send({message: `internal server error!`})
    }

    let resObj = {
        action,
        confidence
    }

    res.status(200).send(resObj)
});

// app.post('/assignment', (req, res) => {
//     request.post({
//         headers: {'content-type': 'application/json'},
//         url: `${heroesService}/hero/${req.body.heroId}`,
//         body: `{
//             "busy": true
//         }`
//     }, (err, heroResponse, body) => {
//         if (!err) {
//             const threatId = parseInt(req.body.threatId);
//             const threat = threats.find(subject => subject.id === threatId);
//             threat.assignedHero = req.body.heroId;
//             res.status(202).send(threat);
//         } else {
//             res.status(400).send({problem: `Hero Service responded with issue ${err}`});
//         }
//     });
// });

app.use(logErr);

// when running tests, dont start a server (testscript already does)
if (process.env.NODE_ENV != 'test') {

    app.listen(port, () => {
        console.log(`BuyAlgo running at localhost:${port}!`);
    })

}

module.exports = app // for tests