import errorCodes from '../phemexclient/errorcodes.json'
import { decryptToJSON } from '../helper/crypt'
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken'
import { EncryptionObject } from '../@types/crypt'
import { PhemexRequestOptions } from '../@types/phemexapi'

interface Payload {
    iv: string,
    encryptedData: string,
    isLivenet: false
}
interface EncryptedApiKeys {
    apiKey: string,
    apiSecretKey: string
}

export function priceToPriceEp(price: number): number {
    return formatPrice(price) * 10000
}
export function priceEpToPrice(price: number): number {
    return formatPrice(price / 10000)
}
export const formatPrice = (originalPrice: number): number => {
    let price: number = Math.trunc(originalPrice*10)
    if (price % 10 < 2) {
        price = Math.trunc(price/10)
    } else if (price % 10 < 8) {
        price = Math.trunc(price/10) + 0.5
    } else {
        price = Math.trunc(price/10) + 1
    }
    return price
}

export function decryptOptions(token: string): PhemexRequestOptions {
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
export function logErrorCode(err: any): string {
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
export function handleResponse(res: any) {
    console.log('res', res)
    const { error, result } = res
    if (error) {
        throw(error)
    } else {
        return result
    }
}