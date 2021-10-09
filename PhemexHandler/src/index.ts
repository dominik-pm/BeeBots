// require('dotenv').config({ path: './variables.env' })

import express, {Application, Request, Response, NextFunction} from 'express';
import authenticate from './middleware/authenticate';

const app: Application = express();
const port: String | Number = process.argv[2] || 8085;



app.get('/', authenticate, (req: Request, res: Response) => {
    res.status(200).send({message: 'working'})
})


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

module.exports = app