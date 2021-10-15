"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const authenticate_1 = __importDefault(require("./middleware/authenticate"));
const logger_1 = require("./middleware/logger");
const phemexhandler_1 = require("./middleware/phemexhandler");
dotenv_1.default.config({ path: './variables.env' });
exports.app = (0, express_1.default)();
const port = process.argv[2] || 8085;
exports.app.use(express_1.default.json());
exports.app.use(logger_1.logTime);
exports.app.get('/', (req, res) => {
    res.status(200).send({ message: 'working' });
});
exports.app.get('/marketAnalysis', authenticate_1.default, phemexhandler_1.getMarketAnalysis, (req, res) => {
    let resObj = req.toSend;
    if (!resObj) {
        console.log('got nothing to send');
        res.status(200);
    }
    res.status(200).send(req.toSend);
});
exports.app.get('/accountInfo', authenticate_1.default, phemexhandler_1.getAccountInfo, (req, res) => {
    let resObj = req.toSend;
    if (!resObj) {
        console.log('got nothing to send');
        res.status(200);
    }
    res.status(200).send(resObj);
});
exports.app.get('/userTrades', authenticate_1.default, phemexhandler_1.getTrades, (req, res) => {
    let resObj = req.toSend;
    if (!resObj) {
        console.log('got nothing to send');
        res.status(200);
    }
    res.status(200).send(resObj);
});
exports.app.get('/*', (req, res) => {
    throw { status: 404, message: 'Not found' };
});
exports.app.use(logger_1.logErr);
// when running tests, dont start a server (testscript already does)
if (process.env.NODE_ENV != 'test') {
    let server = exports.app.listen(port, () => {
        let host = 'localhost';
        // host = server.address().host;
        host = host == '::' ? 'localhost' : host;
        let p = port;
        console.log(`PhemexHandler running at http://${host}:${p}!`);
    });
}
