import dotenv from 'dotenv'
import express, {Application, Request, Response, NextFunction } from 'express'
import authenticate from './middleware/authenticate'
import { logErr, logTime } from './middleware/logger'
import { getAccountInfo, getMarketAnalysis, getPrice, getTrades } from './middleware/phemexhandler'
import { StartLiveData } from './middleware/phemexclient/phemex-livedata'

dotenv.config({path: './variables.env'})

export const app: Application = express()
const port: String | Number = process.env.PORT || 8085

app.use(express.json());
app.use(logTime)
app.use((req: any, res: Response, next: NextFunction) => {
    req.toSend = {}
    next()
})

app.get('/', (req: Request, res: Response) => {
    res.status(200).send({message: 'working'})
})

app.get('/marketdata', authenticate, getMarketAnalysis, getPrice, (req: any, res: Response) => {
    let resObj = getResObject(req, res)
    res.status(200).send(resObj)
})
app.get('/price', authenticate, getPrice, (req: any, res: Response) => {
    let resObj = getResObject(req, res);
    if (!req.toSend.currentPrice) {
        //throw {status: 400, message: 'Not ready yet!'}
    }
    res.status(200).send(resObj)
})

app.get('/accountInfo', authenticate, getAccountInfo, (req: any, res: Response) => {
    // TODO: not working (api signature verification failed -> unhandled rejection)
    let resObj = getResObject(req, res)
    res.status(200).send(resObj)
})
app.get('/userTrades', authenticate, getTrades, (req: any, res: Response) => {
    let resObj = getResObject(req, res)
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
        let p = port

        console.log(`PhemexHandler running at http://${host}:${p}!`)

        StartLiveData()
    })

}


function getResObject(req: any, res: Response) {
    let resObj = req.toSend
    if (!resObj) {
        res.status(200)
        console.log('No response data')
    }
    return resObj
}