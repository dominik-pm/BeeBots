import dotenv from 'dotenv'
import express, {Application, Request, Response, NextFunction } from 'express'
import { logErr, logTime } from './middleware/logger'
import sendResObj from './middleware/resultobject'
import { startLiveData } from './phemexclient/phemex-livedata'
import accountRoutes from './routes/account'
import marketDataRoutes from './routes/marketdata'
import orderRoutes from './routes/order'

dotenv.config({path: './variables.env'})

export const app: Application = express()
const port: String | Number = process.env.PORT || 8085

app.use(express.json())
app.use(logTime)
app.use((req: any, res: Response, next: NextFunction) => {
    req.toSend = {}
    next()
})



// -- routes -->

app.get('/', (req: Request, res: Response) => {
    res.status(200).send({message: 'working'})
})


app.use('/account', accountRoutes, sendResObj)
app.use('/marketdata', marketDataRoutes, sendResObj)
app.use('/order', orderRoutes, sendResObj)


app.get('/*', (req, res) => {
    throw {status: 404, message: 'Not found'}
})

app.use(logErr)

// <-- routes --



// when running tests, dont start a server (testscript already does)
if (process.env.NODE_ENV != 'test') {

    let server = app.listen(port, () => {
        let host = 'localhost'
        // host = server.address().host;
        host = host == '::' ? 'localhost' : host
        let p = port

        console.log(`PhemexHandler running at http://${host}:${p}!`)

        startLiveData()

        // test()
        // .then(res => {
        //     console.log(res)
        // })
        // .catch(err => {
        //     console.log(err)
        // })
    })

}