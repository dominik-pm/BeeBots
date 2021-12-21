import { NextFunction, Request, Response } from 'express'
import { PhemexClient } from './phemexclient/phemex-api-client'
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import { decryptToJSON } from '../helper/crypt';
import { EncryptionObject } from '../@types/crypt';
import { PhemexAccountPosition, PhemexOpenOrder, PhemexRequestOptions } from '../@types/request';
import errorCodes from './phemexclient/errorcodes.json';
import { livePrice } from './phemexclient/phemex-livedata';
import testCcxt from './phemexclient/phemex-api-req-ccxt';
import { logErr } from './logger';

interface Payload {
    iv: string,
    encryptedData: string,
    isLivenet: false
}
interface EncryptedApiKeys {
    apiKey: string,
    apiSecretKey: string
}


export function test() {
    const options: PhemexRequestOptions = {
        apiKey: "ea7308fd-c9d6-4884-ad92-da6b8cd6aaa9",
        secret: "gx2-UEdHM2ZIj_gRpKfm1YmbptZwq7nxGDXrWkR48t1mNzRlYWM0Ny1hMTBhLTRlYzQtYmY1Ni1jNjI2YjE3ODYxYzU",
        isLivenet: false
    }

    // return testCcxt();

    // return PhemexClient.QueryClientsAndWallets({}, options)

    // return PhemexClient.QueryTradingAccountAndPositions({currency: 'BTC'}, options)

    // return PhemexClient.Query24HourTicker({symbol: 'BTCUSD'})

}

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
        logErr({message: msg}, req, res, next)
    })
}
export function getPrice(req: any, res: Response, next: NextFunction) {
    req.toSend.currentPrice = livePrice
    next()
}


export function getAccountInfo(req: any, res: Response, next: NextFunction) {
    const options = decryptOptions(req.token)

    PhemexClient.QueryTradingAccountAndPositions({currency: 'BTC'}, options)
    .then((data: any) => {
        data = handleResponse(data)

        let position: any = null
        if (data.positions.length != 0) {
            const btcPosition = <PhemexAccountPosition>data.positions.find((pos: any) => pos.symbol == 'BTCUSD')
            
            if (btcPosition && btcPosition.avgEntryPrice) {
                position = {
                    entryPrice: btcPosition.avgEntryPrice,
                    side: btcPosition.side,
                    leverage: btcPosition.leverage
                }
            }
        }
        const formattedAccountData: any = {
            userID: data.account.userID,
            btcBalance: (data.account.accountBalanceEv / 100000000),
            position
        }

        req.toSend = formattedAccountData//data
        console.log(data.positions.length)
        console.log(data.positions[0])
        next()
    })
    .catch((err) => {
        console.log('phemex responded with error:', err)
        let msg = logErrorCode(err)
        // throw({message: msg})
        logErr({message: msg}, req, res, next)
    })
}
// TODO:
export function getActiveTrades(req: any, res: Response, next: NextFunction) {
    const options = decryptOptions(req.token)

    PhemexClient.QueryUserTrades({symbol: 'BTCUSD'}, options)
    .then((data: any) => {
        
        const orders = <PhemexOpenOrder[]>data.result.rows
        let formattedOrders: [] = []
        if (orders.length > 0) {
            // TODO:
        }
        
        req.toSend = formattedOrders//orders
        next()
    })
    .catch((err) => {
        console.log('phemex responded with error:', err)
        let msg = logErrorCode(err)
        // throw({message: msg})
        logErr({message: msg}, req, res, next)
    })
}
// TODO:
export function getActiveOrders(req: any, res: Response, next: NextFunction) {
    const options = decryptOptions(req.token)

    PhemexClient.QueryOpenOrdersBySymbol({symbol: 'BTCUSD'}, options)
    .then((data: any) => {
        req.toSend = data
        next()
    })
    .catch((err) => {
        console.log('phemex responded with error:', err)
        let msg = logErrorCode(err)
        // throw({message: msg})
        logErr({message: msg}, req, res, next)
    })
}




function decryptOptions(token: string): PhemexRequestOptions {
    // get payload out of token
    let payload = <Payload>jwt.decode(token)
    // console.log('payload: ', payload)

    let encrypted: EncryptionObject = {
        iv: payload.iv,
        encryptedData: payload.encryptedData
    }
    const decryptedKeys = <EncryptedApiKeys>decryptToJSON(encrypted)

    const options: PhemexRequestOptions = {
        apiKey: decryptedKeys.apiKey,
        secret: decryptedKeys.apiSecretKey,
        isLivenet: payload.isLivenet
    }

    return options;
}
function logErrorCode(err: any): string {
    let codes: any = errorCodes;
    const code = err.code
    let error = codes[code];

    if (error) {
        console.log(error.message);
        console.log(error.details);
    } else {
        console.log(code, err.msg);
    }
    if (error) {
        return error.details;
    } else {
        return err.msg;
    }
}
function handleResponse(res: any) {
    console.log('res', res)
    const { error, result } = res
    if (error) {
        throw(error)
    } else {
        return result
    }
}