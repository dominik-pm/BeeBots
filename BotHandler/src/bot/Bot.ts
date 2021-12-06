import { TradingPermission } from '../@types/Bot'

export default class Bot {
    authToken: string
    name: string
    tradingPermission: TradingPermission

    constructor(token: string, tradingPermission: TradingPermission, name: string) {
        this.authToken = token
        this.tradingPermission = tradingPermission
        this.name = name
    }

    
   
    toString() {
        return `Hello, Im ${this.name}! I am trading ${this.tradingPermission}!`;
    }
}