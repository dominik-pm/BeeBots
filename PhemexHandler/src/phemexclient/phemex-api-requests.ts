import request from 'request';
import { createHmac } from 'crypto';
import { PhemexRequestOptions } from '../@types/phemexapi';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

const urls = {
    livenet: 'https://api.phemex.com',
    testnet: 'https://testnet-api.phemex.com'
}

interface HttpOptions {
    url: string,
    method: Method,
    json: boolean,
    [key: string]: any
}

export async function getRequest(endpoint: string, params: any, options: PhemexRequestOptions) {
    return await makeRequest('GET', endpoint, params, options);
}

export async function postRequest(endpoint: string, params: any, options: PhemexRequestOptions) {
    return await makeRequest('POST', endpoint, params, options);
}

export async function putRequest(endpoint: string, params: any, options: PhemexRequestOptions) {
    return await makeRequest('PUT', endpoint, params, options);
}

export async function deleteRequest(endpoint: string, params: any, options: PhemexRequestOptions) {
    return await makeRequest('DELETE', endpoint, params, options);
}

async function makeRequest(method: Method, endpoint: string, params: any, options: PhemexRequestOptions): Promise<any> {

    // Define variables
    let expiry = Date.now() + 60000;
    let baseURL = urls[options.isLivenet ? 'livenet' : 'testnet'];
    // console.log(options)
    let signature;
    let content = '';

    if (method === 'GET' || method === 'DELETE' || method === 'PUT') {

        // Lets check if params is not undefined
        if (params !== undefined) {
            content = `${endpoint}${serializeParams(params) + expiry}`;
        } else {
            content = `${endpoint}${expiry}`;
        };

    }


    if (method === 'POST') {
        content = `${endpoint}${expiry + JSON.stringify(params)}`;
        if (params.hasOwnProperty('otpCode')) {
            let otpCode = params.otpCode;
            delete params.otpCode;
            content = `${endpoint}otpCode=${otpCode}${expiry + JSON.stringify(params)}`;
            endpoint = `${endpoint}?otpCode=${otpCode}`;
        }
    }

    signature = generateSignature(content, options.secret);

    const httpOptions: HttpOptions = {
        url: [baseURL, endpoint].join(''),
        method,
        json: true,
        headers: {
            'x-phemex-access-token': options.apiKey,
            'x-phemex-request-expiry': expiry,
            'x-phemex-request-signature': signature,
        }
    }
    // console.log([baseURL, endpoint].join(''))

    if (method === 'GET' || method === 'PUT' || method === 'DELETE') {
        if (params) {
            httpOptions.qs = params;
        }
    }

    if (method === 'POST') {
        httpOptions.body = params;
    }

    if (method === 'PUT') {
        console.log('PUTTING')
        console.log(httpOptions)
    }

    return new Promise((resolve, reject) => {
        request(httpOptions, function callback(err: any, res: any, body: any) {
            /* body:
                {
                    "code": <code>, [not 0 if error]
                    "msg": <msg>,
                    "data": <data>
                }
            */
            
            if (!res.body.result && res.body.code != 0 && !res.body.error) {
                reject({msg: res.body.msg, code: res.body.code});
            } else {
                // TODO: phemex sends different formats for diff requests
                let res = body.data
                if (!body.data) {
                    res = body.result
                }
                resolve({result: res});
            }
        });
    });
};

function generateSignature(message: string, secret: string) {
    return createHmac('sha256', secret).update(message).digest('hex')
};

function serializeParams(params: any) {
    return Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&');
}