import request from 'request';
import { createHmac } from 'crypto';
import { PhemexRequestOptions } from '../../@types/request';

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

async function makeRequest(method: Method, endpoint: string, params: any, options: PhemexRequestOptions) {

    // Define variables
    let expiry = Date.now() + 60000;
    let baseURL = urls[options.isLivenet ? 'livenet' : 'testnet'];
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

    // TODO: get hashed api key out of params and decrypt the secret

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

    if (method === 'GET' || method === 'PUT' || method === 'DELETE') {
        if (params) {
            httpOptions.qs = params;
        }
    }

    if (method === 'POST') {
        httpOptions.body = params;
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
           console.log(res.body)
            if (!res.body.result && res.body.code != 0 && !res.body.error) {
                reject(res.body.code);
            } else {
                resolve(body);
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