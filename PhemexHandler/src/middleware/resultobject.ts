import { Response } from 'express'

export default function sendResObject(req: any, res: Response) {
    let resObj = getResObject(req, res)

    console.log('res:', resObj)

    if (Object.keys(resObj).length == 0) {
        console.log('No response data')
        res.status(200).send({})
    } else {
        res.status(200).send(resObj)
    }
}

export function getResObject(req: any, res: Response) {
    return req.toSend
}