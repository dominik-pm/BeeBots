const express = require('express')
const Joi = require('joi')
const { currentTime } = require('./helpers/helperFunctions')
const { getTradeCall, algDataSchema } = require('./algorithm/rdm')
const app = express()
const port = process.argv[2] || 8087

app.use(express.json())

app.get('/tradecall', (req, res) => {
    console.log(`Tradecall requested at ${currentTime()}!`);

    const {value, error, warning} = algDataSchema.validate(req.body, {allowUnknown: true})
    console.log(value);

    if (warning) {
        console.warn(warning);
    }
    if (error) {
        let errMsg = error.details[0].message.replace('"', '\'').replace('"', '\'')
        throw {status: 431, message: errMsg} // instead of: return res.status(431).send({message: errMsg})
    }

    const {action, confidence} = getTradeCall(req.body);

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

// error handling
app.use(function(err, req, res, next) {
    // expected error (400)
    if (err.status) {
        console.log(err.message)
        res.status(err.status).json({status: err.status, message: err.message})
    } 
    // unexpected error (500)
    else {
        console.error(err);
        res.status(530).json({message: 'internal server error'})
    }
})

// when running tests, dont start a server (testscript already does)
if (process.env.NODE_ENV != 'test') {

    app.listen(port, () => {
        console.log(`BuyAlgo running at localhost:${port}!`);
    })

}

module.exports = app // for tests