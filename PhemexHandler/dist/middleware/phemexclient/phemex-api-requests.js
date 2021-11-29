"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRequest = exports.putRequest = exports.postRequest = exports.getRequest = void 0;
const request_1 = __importDefault(require("request"));
const crypto_1 = require("crypto");
const urls = {
    livenet: 'https://api.phemex.com',
    testnet: 'https://testnet-api.phemex.com'
};
async function getRequest(endpoint, params, options) {
    return await makeRequest('GET', endpoint, params, options);
}
exports.getRequest = getRequest;
async function postRequest(endpoint, params, options) {
    return await makeRequest('POST', endpoint, params, options);
}
exports.postRequest = postRequest;
async function putRequest(endpoint, params, options) {
    return await makeRequest('PUT', endpoint, params, options);
}
exports.putRequest = putRequest;
async function deleteRequest(endpoint, params, options) {
    return await makeRequest('DELETE', endpoint, params, options);
}
exports.deleteRequest = deleteRequest;
async function makeRequest(method, endpoint, params, options) {
    // Define variables
    let expiry = Date.now() + 60000;
    let baseURL = urls[options.isLivenet ? 'livenet' : 'testnet'];
    let signature;
    let content = '';
    if (method === 'GET' || method === 'DELETE' || method === 'PUT') {
        // Lets check if params is not undefined
        if (params !== undefined) {
            content = `${endpoint}${serializeParams(params) + expiry}`;
        }
        else {
            content = `${endpoint}${expiry}`;
        }
        ;
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
    const httpOptions = {
        url: [baseURL, endpoint].join(''),
        method,
        json: true,
        headers: {
            'x-phemex-access-token': options.apiKey,
            'x-phemex-request-expiry': expiry,
            'x-phemex-request-signature': signature,
        }
    };
    if (method === 'GET' || method === 'PUT' || method === 'DELETE') {
        if (params) {
            httpOptions.qs = params;
        }
    }
    if (method === 'POST') {
        httpOptions.body = params;
    }
    return new Promise((resolve, reject) => {
        (0, request_1.default)(httpOptions, function callback(err, res, body) {
            /* body:
                {
                    "code": <code>, [not 0 if error]
                    "msg": <msg>,
                    "data": <data>
                }
            */
            console.log(res.body);
            if (!res.body.result && res.body.code != 0 && !res.body.error) {
                reject(res.body.code);
            }
            else {
                resolve(body);
            }
        });
    });
}
;
function generateSignature(message, secret) {
    return (0, crypto_1.createHmac)('sha256', secret).update(message).digest('hex');
}
;
function serializeParams(params) {
    return Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&');
}
