import {Request, Response, NextFunction} from 'express';

export default function authenticate(req: Request, res: Response, next: NextFunction) {
    next();
}