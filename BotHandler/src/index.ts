import dotenv from 'dotenv'
import express, { Application, NextFunction, Response } from 'express'
import authenticate from './middleware/authenticate'
import { logErr, logTime } from './middleware/logger'

dotenv.config({path: './variables.env'})

export const app: Application = express()
const port: String | Number = process.argv[2] || 8084

app.use(express.json())
app.use(logTime)

app.use((req: any, res: Response, next: NextFunction) => {
    req.toSend = {};
    next()
})





app.get('/*', (req, res) => {
    throw {status: 404, message: 'Not found'}
})

app.use(logErr)


// when running tests, dont start a server (testscript already does)
if (process.env.NODE_ENV != 'test') {

    let server = app.listen(port, () => {
        let host = 'localhost';
        // host = server.address().host;
        host = host == '::' ? 'localhost' : host
        let p = port

        console.log(`BotHandler running at http://${host}:${p}!`)

        
    })

}