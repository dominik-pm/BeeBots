import { NextFunction, Request } from 'express'

export const validateParams = function (requestParams: any) {
    return function (req: Request, res: any, next: NextFunction) {
        for (let param of requestParams) {
            if (checkParamPresent(Object.keys(req.body), param)) {
                let reqParam = req.body[param.paramKey]
                if (!checkParamType(reqParam, param)) {
                    return res.status(400).send({
                        message: `${param.paramKey} is of type ` +
                        `${typeof reqParam} but should be ${param.type}`
                    })
                } else {
                    if (!runValidators(reqParam, param)) {
                        return res.status(409).send({
                            message: `Validation failed for ${param.paramKey}`
                        })
                    }
                }
            } else if (param.required){
                return res.status(400).send(400, {
                    message: `Missing Parameter ${param.paramKey}`
                })
            }
        }
        next()
    }
}

const checkParamPresent = function (reqParams: any, paramObj: any) {
    return (reqParams.includes(paramObj.paramKey))
}

const checkParamType = function (reqParam: any, paramObj: any) {
    const reqParamType = typeof reqParam
    return reqParamType === paramObj.type
}

const runValidators = function (reqParam: any, paramObj: any) {
    for (let validator of paramObj.validatorFunctions) {
        if (!validator(reqParam)) {
            return false
        }
    }
    return true
}