"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authenticate(req, res, next) {
    const token = req.headers?.authorization?.split(' ')[1];
    if (!token) {
        throw { status: 401, message: 'Authentication failed!' };
    }
    req.token = token;
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
        throw { message: 'Couldn\'t load secret key!' };
    }
    try {
        jsonwebtoken_1.default.verify(token, secret, { algorithms: ['HS256'] }, (err, payload) => {
            if (err) {
                throw { status: 401, message: 'Authentication failed!' };
            }
            req.payload = payload;
            next();
        });
    }
    catch (error) {
        throw { status: 401, message: 'Authentication failed!' };
    }
}
exports.default = authenticate;
