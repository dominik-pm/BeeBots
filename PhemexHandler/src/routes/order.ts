import express from 'express'
import * as Controller from '../controllers/order'
import authenticate from '../middleware/authenticate'
import { validateParams } from '../middleware/validateBodyParameters'

const router = express.Router()

router.post('/placeentry', authenticate, validateParams([
    {paramKey: 'orderID', required: true, type: 'string', validatorFunctions: [(param: any) => {return param.length >= 4}]},
    {paramKey: 'price', required: true, type: 'number', validatorFunctions: [(param: any) => {return param > 0}]},
    {paramKey: 'stopLoss', required: true, type: 'number', validatorFunctions: [(param: any) => {return param > 0}]}
]), Controller.placeEntry)

router.post('/placetakeprofit', authenticate, validateParams([
    {paramKey: 'takeProfit', required: true, type: 'number', validatorFunctions: [(param: any) => {return param > 0}]}
]), Controller.placeTakeProfit)

router.post('/placestoploss', authenticate, validateParams([
    {paramKey: 'stopLoss', required: true, type: 'number', validatorFunctions: [(param: any) => {return param > 0}]}
]), Controller.placeStopLoss)

router.delete('/closeall', authenticate, Controller.closeAll)

router.delete('/:orderId', authenticate, Controller.cancelOrder)


export = router