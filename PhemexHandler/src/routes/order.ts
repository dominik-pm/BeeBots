import express, { Response } from 'express'
import * as Controller from '../controllers/order'
import authenticate from '../middleware/authenticate'

const router = express.Router()

router.post('/placeentry', authenticate, Controller.placeEntry)

router.post('/placetakeprofit', authenticate, Controller.placeTakeProfit)

router.delete('/cancel', authenticate, Controller.cancelOrder)

router.delete('/closeall', authenticate, Controller.closeAll)


export = router