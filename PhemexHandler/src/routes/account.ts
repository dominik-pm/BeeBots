import express, { Response } from 'express'
import * as Controller from '../controllers/account'
import authenticate from '../middleware/authenticate'

const router = express.Router()


router.get('/', authenticate, Controller.getAccountInfo)
    
router.get('/openposition', authenticate, Controller.getActiveTrade)

router.get('/openorders', authenticate, Controller.getActiveOrders)

router.get('/closedtrades', authenticate, Controller.getClosedTrades)


export = router