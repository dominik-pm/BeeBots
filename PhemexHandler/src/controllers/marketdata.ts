import { NextFunction, Response } from 'express'
import { handleResponse, logErrorCode } from '../helper/phemexapihelper'
import { logErr } from '../middleware/logger'
import { PhemexClient } from '../phemexclient/phemex-api-client'
import { livePrice } from '../phemexclient/phemex-livedata'




export function getMarketAnalysis(req: any, res: Response, next: NextFunction) {
    PhemexClient.Query24HourTicker({symbol: 'BTCUSD'})
    .then((data: any) => {
        req.toSend.marketData = handleResponse(data)
        next()
    })
    .catch((err) => {
        console.log('phemex responded with error:', err)
        let msg = logErrorCode(err)
        // throw({message: msg})    // TODO: logErr should be called when throwing
        logErr({message: msg}, req, <any>res, next)
    })
}

export function getPrice(req: any, res: Response, next: NextFunction) {
    req.toSend.currentPrice = livePrice
    next()
}
