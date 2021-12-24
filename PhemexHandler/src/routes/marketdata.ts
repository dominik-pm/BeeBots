import express, { Response } from 'express'
import * as Controller from '../controllers/marketdata'
import authenticate from '../middleware/authenticate'

const router = express.Router()

router.get('/', authenticate, Controller.getMarketAnalysis)

router.get('/price', authenticate, Controller.getPrice, (req: any, res: Response) => {
    if (!req.toSend.currentPrice) {
        //throw {status: 400, message: 'Not ready yet!'}
    }
    res.status(200).send(req.toSend)
})

export = router