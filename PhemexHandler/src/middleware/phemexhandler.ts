import { NextFunction, Request, Response } from 'express'
import { PhemexClient } from './phemexclient/phemex-api-client'
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import { decryptToJSON } from '../helper/crypt';
import { EncryptionObject } from '../@types/crypt';
import { PhemexRequestOptions } from '../@types/request';
import errorCodes from './phemexclient/errorcode.json';

export function getMarketAnalysis(req: any, res: Response, next: NextFunction) {
    PhemexClient.Query24HourTicker({symbol: 'BTCUSD'})
    .then((data: any) => {
        const result: any = handleResponse(data)
        req.toSend = result
        next()
    })
    .catch((err) => {
        console.log(err)
        throw(err)
    })
}

interface Payload {
    iv: string,
    encryptedData: string,
    isLivenet: false
}
interface EncryptedApiKeys {
    apiKey: string,
    apiSecretKey: string
}

export function getAccountInfo(req: any, res: Response, next: NextFunction) {
    // TODO: function? or middleware?
    const token = req.token;
    
    // get payload out of token
    let payload = <Payload>jwt.decode(token)
    console.log('payload: ', payload)

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
    // <-- TODO:

    PhemexClient.QueryTradingAccountAndPositions({symbol: 'BTCUSD', currency: 'BTC'}, options)
    .then((data: any) => {
        const result: any = handleResponse(data)
        req.toSend = result
        next()
    })
    .catch((err) => {
        console.log('phemex responded with error: ' + err)
        let msg = logErrorCode(err)
        throw(msg)
    })
}

function logErrorCode(code: string): string {
    let codes: any = errorCodes;
    let error = codes[code];
    if (error) {
        console.log(error.message);
        console.log(error.details);
    } else {
        console.log("no details with that error code");
    }
    return error.details;
}

function handleResponse(res: any) {
    const { error, result } = res
    if (error) {
        throw(error)
    } else {
        return result
    }
}