"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrades = exports.getAccountInfo = exports.getMarketAnalysis = void 0;
const phemex_api_client_1 = require("./phemexclient/phemex-api-client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypt_1 = require("../helper/crypt");
const errorcode_json_1 = __importDefault(require("./phemexclient/errorcode.json"));
function getMarketAnalysis(req, res, next) {
    phemex_api_client_1.PhemexClient.Query24HourTicker({ symbol: 'BTCUSD' })
        .then((data) => {
        req.toSend = handleResponse(data);
        next();
    })
        .catch((err) => {
        console.log(err);
        throw (err);
    });
}
exports.getMarketAnalysis = getMarketAnalysis;
function getAccountInfo(req, res, next) {
    const options = decryptOptions(req.token);
    phemex_api_client_1.PhemexClient.QueryTradingAccountAndPositions({ symbol: 'BTCUSD', currency: 'BTC' }, options)
        .then((data) => {
        req.toSend = handleResponse(data);
        next();
    })
        .catch((err) => {
        console.log('phemex responded with error:', err);
        let msg = logErrorCode(err);
        throw (msg);
    });
}
exports.getAccountInfo = getAccountInfo;
function getTrades(req, res, next) {
    const options = decryptOptions(req.token);
    phemex_api_client_1.PhemexClient.QueryUserTrades({}, options)
        .then((data) => {
        req.toSend = handleResponse(data);
        next();
    })
        .catch((err) => {
        console.log('phemex responded with error:', err);
        let msg = logErrorCode(err);
        throw ({ message: msg });
    });
}
exports.getTrades = getTrades;
function decryptOptions(token) {
    // get payload out of token
    let payload = jsonwebtoken_1.default.decode(token);
    // console.log('payload: ', payload)
    let encrypted = {
        iv: payload.iv,
        encryptedData: payload.encryptedData
    };
    const decryptedKeys = (0, crypt_1.decryptToJSON)(encrypted);
    const options = {
        apiKey: decryptedKeys.apiKey,
        secret: decryptedKeys.apiSecretKey,
        isLivenet: payload.isLivenet
    };
    return options;
}
function logErrorCode(code) {
    let codes = errorcode_json_1.default;
    let error = codes[code];
    if (error) {
        console.log(error.message);
        console.log(error.details);
    }
    else {
        console.log(code);
    }
    if (error) {
        return error.details;
    }
    else {
        return code;
    }
}
function handleResponse(res) {
    const { error, result } = res;
    if (error) {
        throw (error);
    }
    else {
        return result;
    }
}
