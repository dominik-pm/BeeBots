import { NextFunction, Request, Response } from 'express'
import { PhemexClient } from './phemexclient/phemex-api-client'
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import { decryptToJSON } from '../helper/crypt';
import { EncryptionObject } from '../@types/crypt';
import { PhemexRequestOptions } from '../@types/request';
import errorCodes from './phemexclient/errorcodes.json';
import { livePrice } from './phemexclient/phemex-livedata';

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
    };

    return testCcxt();

    // return PhemexClient.QueryTradingAccountAndPositions({symbol: 'BTCUSD', currency: 'BTC'}, options)

    // return PhemexClient.Query24HourTicker({symbol: 'BTCUSD'})
}

export function getMarketAnalysis(req: any, res: Response, next: NextFunction) {
    PhemexClient.Query24HourTicker({symbol: 'BTCUSD'})
    .then((data: any) => {
        req.toSend.marketData = handleResponse(data)
        next()
    })
    .catch((err) => {
        console.log(err)
        throw(err)
    })
}
export function getPrice(req: any, res: Response, next: NextFunction) {
    req.toSend.currentPrice = livePrice
    next()
}


export function getAccountInfo(req: any, res: Response, next: NextFunction) {
    const options = decryptOptions(req.token);

    PhemexClient.QueryTradingAccountAndPositions({symbol: 'BTCUSD', currency: 'BTC'}, options)
    .then((data: any) => {
        req.toSend = handleResponse(data)
        next()
    })
    .catch((err) => {
        console.log('phemex responded with error:', err)
        let msg = logErrorCode(err)
        throw(msg)
    })
}
export function getTrades(req: any, res: Response, next: NextFunction) {
    const options = decryptOptions(req.token);

    PhemexClient.QueryUserTrades({}, options)
    .then((data: any) => {
        req.toSend = handleResponse(data)
        next()
    })
    .catch((err) => {
        console.log('phemex responded with error:', err)
        let msg = logErrorCode(err)
        throw({message: msg})
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
function logErrorCode(code: string): string {
    let codes: any = errorCodes;
    let error = codes[code];
    if (error) {
        console.log(error.message);
        console.log(error.details);
    } else {
        console.log(code);
    }
    if (error) {
        return error.details;
    } else {
        return code;
    }
}
function handleResponse(res: any) {
    const { error, result } = res
    if (error) {
        throw(error)
    } else {
        return result
    }
}