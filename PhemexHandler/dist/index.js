"use strict";
// require('dotenv').config({ path: './variables.env' })
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authenticate_1 = __importDefault(require("./middleware/authenticate"));
const app = (0, express_1.default)();
const port = process.argv[2] || 8085;
app.get('/', authenticate_1.default, (req, res) => {
    res.status(200).send({ message: 'working' });
});
// when running tests, dont start a server (testscript already does)
if (process.env.NODE_ENV != 'test') {
    let server = app.listen(port, () => {
        let host = 'localhost';
        // host = server.address().host;
        host = host == '::' ? 'localhost' : host;
        let p = port;
        console.log(`PhemexHandler running at http://${host}:${p}!`);
    });
}
module.exports = app;
