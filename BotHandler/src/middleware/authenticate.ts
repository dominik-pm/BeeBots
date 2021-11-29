import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export default function authenticate(req: any, res: Response, next: NextFunction) {
    const token = req.headers?.authorization?.split(' ')[1];
    if (!token) {
        throw {status: 401, message: 'Authentication failed!'}
    }
    req.token = token;

    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
        throw {message: 'Couldn\'t load secret key!'}
    }

    try {
        jwt.verify(token, secret, {algorithms: ['HS256']}, (err: any, payload: any) => {
            if (err) {
                throw {status: 401, message: 'Authentication failed!'}
            }
            req.payload = payload;
            next();
        });
    }
    catch (error) {
        throw {status: 401, message: 'Authentication failed!'}
    }
}