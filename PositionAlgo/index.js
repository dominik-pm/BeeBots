const express = require('express')
const app = express()
const port = 8088

app.use(express.json())

app.get('/positionupdate', (req, res) => {
    console.log(`Positionupdate requested at ${currentTime()}!`);
    console.log(req.body);

    const { currentPrice, entryPrice, stopLoss, takeProfit } = req.body

    if (!currentPrice) {
        console.log('currentPrice not given');
        res.status(441).send({message: `'currentPrice' is required!`})
        return
    }
    if (!entryPrice) {
        console.log('entryPrice not given');
        res.status(442).send({message: `'entryPrice' is required!`})
        return
    }
    if (!stopLoss) {
        console.log('stopLoss not given');
        res.status(443).send({message: `'stopLoss' is required!`})
        return
    }

    let side = stopLoss < entryPrice ? 'long' : 'short'
    let newPosition = getPositionUpdate(side, currentPrice, entryPrice, stopLoss, takeProfit)

    console.log(`responding with:`)
    console.log(newPosition)

    res.status(200).send(newPosition)

})

app.listen(port, () => {
    console.log(`PositionAlgo running at localhost:${port}!`)
})


function getPositionUpdate(side, currentPrice, entryPrice, stopLoss, takeProfit) {
    let newTakeProfit = takeProfit
    if (!takeProfit) {
        let stopDistance = entryPrice-stopLoss
        newTakeProfit = entryPrice + (2*stopDistance)
    }

    let newPosition = {
        stopLoss, newTakeProfit
    }

    return newPosition
}


function currentTime() {
    return new Date().toTimeString().split(' ')[0];
}