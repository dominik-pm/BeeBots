const express = require('express');
const app = express();
const port = 8089;

app.use(express.json());

app.get('/tradecall', (req, res) => {
    console.log(`Tradecall requested at ${currentTime()}!`);
    console.log(req.body);

    // res.status(400).send({
    //     message: 'You are an idiot'
    // })

    // res.status(500).send({
    //     message: 'Server error'
    // })

    let resObj = {
        action: 'Buy',
        confidence: Math.random()
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


function currentTime() {
    return new Date().toTimeString().split(' ')[0];
}