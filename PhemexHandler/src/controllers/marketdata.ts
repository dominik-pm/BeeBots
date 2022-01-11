import { NextFunction, Response } from 'express'
import { PhemexMarketData } from '../@types/phemexapi'
import { MarketData } from '../@types/phemexhandler'
import { convertFromEr, evAmountToBTCAmount, handleResponse, logErrorCode, priceEpToPrice } from '../helper/phemexapihelper'
import { logErr } from '../middleware/logger'
import { PhemexClient } from '../phemexclient/phemex-api-client'
import { livePrice } from '../phemexclient/phemex-livedata'




export function getMarketAnalysis(req: any, res: Response, next: NextFunction) {
    PhemexClient.Query24HourTicker({symbol: 'BTCUSD'})
    .then((data: any) => {
        const marketData: PhemexMarketData = {
            ...formatMarketData(handleResponse(data))
        }
        const res: MarketData = {
            ...marketData,
            currentPrice: livePrice
        }
        req.toSend = res
        next()
    })
    .catch((err) => {
        console.log('phemex responded with error:', err)
        let msg = logErrorCode(err)
        // throw({message: msg})    // TODO: logErr should be called when throwing
        logErr({message: msg}, req, <any>res, next)
    })
}

function formatMarketData(marketData: PhemexMarketData): PhemexMarketData {
    return {
        ...marketData,
        // symbol: marketData.symbol,
        indexPrice: priceEpToPrice(marketData.indexPrice),
        markPrice: priceEpToPrice(marketData.markPrice),
        close: priceEpToPrice(marketData.close),
        high: priceEpToPrice(marketData.high),
        low: priceEpToPrice(marketData.low),
        open: priceEpToPrice(marketData.open),
        fundingRate: convertFromEr(marketData.fundingRate),
        predFundingRate: convertFromEr(marketData.predFundingRate),
        // openInterest: marketData.openInterest,
        turnover: evAmountToBTCAmount(marketData.turnover),
        // volume: marketData.volume,
        // timestamp: number
    }
}

export function getPrice(req: any, res: Response, next: NextFunction) {
    req.toSend.currentPrice = livePrice
    next()
}
