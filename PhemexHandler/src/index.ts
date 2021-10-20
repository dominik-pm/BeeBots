import dotenv from 'dotenv';
import express, {Application, Request, Response, NextFunction } from 'express';
import authenticate from './middleware/authenticate';
import { logErr, logTime } from './middleware/logger';
import { getAccountInfo, getMarketAnalysis, getTrades, test } from './middleware/phemexhandler';

dotenv.config({path: './variables.env'})

export const app: Application = express();
const port: String | Number = process.argv[2] || 8085;

app.use(express.json()); 
app.use(logTime);

test()
.then((data: any) => {
    console.log(data)
})
.catch((err) => {
    console.log(err)
})

app.get('/', (req: Request, res: Response) => {
    res.status(200).send({message: 'working'})
})

app.get('/marketAnalysis', authenticate, getMarketAnalysis, (req: any, res: Response) => {
    let resObj = req.toSend;
    if (!resObj) {
        console.log('got nothing to send')
        res.status(200)
    }
    res.status(200).send(req.toSend)
})
app.get('/accountInfo', authenticate, getAccountInfo, (req: any, res: Response) => {
    let resObj = req.toSend;
    if (!resObj) {
        console.log('got nothing to send')
        res.status(200)
    }
    res.status(200).send(resObj)
})
app.get('/userTrades', authenticate, getTrades, (req: any, res: Response) => {
    let resObj = req.toSend;
    if (!resObj) {
        console.log('got nothing to send')
        res.status(200)
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
        let host = 'localhost';
        // host = server.address().host;
        host = host == '::' ? 'localhost' : host
        let p = port;

        console.log(`PhemexHandler running at http://${host}:${p}!`)
    })

}