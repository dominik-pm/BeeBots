const request = require("request");
const { createHmac } = require("crypto");

const urls = {
    livenet: 'https://api.phemex.com',
    testnet: 'https://testnet-api.phemex.com'
}

module.exports = class Request {
    constructor(apiKey, secret, livenet = false) {
        this.baseURL = urls[livenet === true ? "livenet" : "testnet"];
        this.apiKey = apiKey;
        this.secret = secret;
    };

    async getRequest(endpoint, params) {
        return await this.makeRequest("GET", endpoint, params);
    };

    async postRequest(endpoint, params) {
        return await this.makeRequest("POST", endpoint, params);
    };

    async putRequest(endpoint, params) {
        return await this.makeRequest("PUT", endpoint, params);;
    };

    async deleteRequest(endpoint, params) {
        return await this.makeRequest("DELETE", endpoint, params);
    };

    async makeRequest(method, endpoint, params) {

        // Define variables
        let expiry = Date.now() + 60000;
        let signature;
        let content;

        if (method === "GET" || method === "DELETE" || method === "PUT") {

            // Lets check if params is not undefined
            if (params !== undefined) {
                content = `${endpoint}${this.serializeParams(params) + expiry}`;
            } else {
                content = `${endpoint}${expiry}`;
            };

        }


        if (method === "POST") {
            content = `${endpoint}${expiry + JSON.stringify(params)}`;
            if (params.hasOwnProperty("otpCode")) {
                let otpCode = params.otpCode;
                delete params.otpCode;
                content = `${endpoint}otpCode=${otpCode}${expiry + JSON.stringify(params)}`;
                endpoint = `${endpoint}?otpCode=${otpCode}`;
            }
        }

        signature = this.generateSignature(content, this.secret);

        const options = {
            url: [this.baseURL, endpoint].join(""),
            method,
            json: true,
            headers: {
                "x-phemex-access-token": this.apiKey,
                "x-phemex-request-expiry": expiry,
                "x-phemex-request-signature": signature,
            }
        }

        if (method === "GET" || method === "PUT" || method === "DELETE") {
            if (params) {
                options.qs = params;
            }
        }

        if (method === "POST") {
            options.body = params;
        }

        return new Promise((resolve, reject) => {
            request(options, function callback(err, res, body) {
                /* body:
                    {
                        "code": <code>, [not 0 if error]
                        "msg": <msg>,
                        "data": <data>
                    }
                */
                if (!res.body.result && res.body.code != 0) {
                    reject(res.body.code);
                } else {
                    resolve(body);
                }
            });
        });
    };

    generateSignature(message, secret) {
        return createHmac("sha256", secret).update(message).digest("hex")
    };

    serializeParams(params) {
        return Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&');
    }
}