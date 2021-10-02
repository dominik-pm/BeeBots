const express = require('express')
const app = express()
const port = 8087

app.use(express.json())

app.get('/tradecall', (req, res) => {
    console.log(`Tradecall requested at ${currentTime()}!`);
    console.log(req.body);

    const {currentPrice, marketData} = req.body;

    if (!currentPrice) {
        console.log('currentPrice not given');
        res.status(431).send({message: `'currentPrice' is required!`})
        return
    }
    if (!marketData) {
        console.log('marketData not given');
        res.status(432).send({message: `'marketData' is required!`})
        return
    }
    if (!marketData.dailyLow) {
        console.log('marketData.dailyLow not given');
        res.status(432).send({message: `'marketData.dailyLow' is required!`})
        return
    }

    // res.status(500).send({
    //     message: 'Server error'
    // })

    const {action, confidence} = getTradeCall(currentPrice, marketData);
    if (!action || !confidence) {
        console.log('internal error: no action or confidence');
        console.log(`action: ${action}`);
        console.log(`confidence: ${confidence}`);
        res.status(531).send({message: `internal server error!`})
        return
    }

    let resObj = {
        action,
        confidence
    }

    console.log(`responding with:`);
    console.log(resObj);

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

app.listen(port, () => {
    console.log(`BuyAlgo running at localhost:${port}!`);
})


function getTradeCall(currentPrice, marketData) {
    return {
        action: 'Buy',
        confidence: Math.random()
    }
}


function currentTime() {
    return new Date().toTimeString().split(' ')[0];
}