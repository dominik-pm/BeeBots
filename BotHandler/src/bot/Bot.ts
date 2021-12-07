import { ActiveTrade, RiskProfile, TradingPermission, Transaction } from '../@types/Bot'
import { getTradeCall } from '../api/Api'
import { openPosition } from './Actions'

const defaultRiskProfile: RiskProfile = {
    tradeThreshhold: 0.8,           // minimum confidence to execute a trade
    capitalRiskPerTrade: 0.02       // percentag of total capital to risk per trade
}

export default class Bot {
    authToken: string
    name: string
    tradingPermission: TradingPermission
    currentTrade: ActiveTrade | null
    tradeHistory: Transaction[]
    riskProfile: RiskProfile

    constructor(token: string, tradingPermission: TradingPermission, name: string, riskProfile = defaultRiskProfile, currentTrade: ActiveTrade | null = null) {
        this.authToken = token
        this.tradingPermission = tradingPermission
        this.name = name
        this.currentTrade = currentTrade
        this.tradeHistory = []
        this.riskProfile = riskProfile
    }

    decideAction(data: any) {
        // const { currentPrice, marketData } = data

        if (!this.currentTrade) {
            // looking for a trade
            getTradeCall(this.authToken, data)
            .then(res => {
                console.log(res)
                if (res.confidence > this.riskProfile.tradeThreshhold) {
                    openPosition(this, res.action)
                }
            })
            .catch(err => {
                console.log(err)
            })
        } else {
            // currently in a trade

        }

    }

    openedPosition(entry: Number, side: 'long' | 'short' , stopLoss: Number, takeProfit: Number | null) {
        this.currentTrade = {
            entryPrice: entry,
            exitPrice: null,
            isFilled: true,
            side,
            stopLoss,
            takeProfit
        }
    }

    closedPosition(profit: Number) {
        if (!this.currentTrade) {
            return
        }
        if (!this.currentTrade.exitPrice) {
            return
        }

        let newTrade: Transaction = {
            entryPrice: this.currentTrade.entryPrice,
            exitPrice: this.currentTrade.exitPrice,
            profit
        }

        // add the new trade to the history
        this.tradeHistory.push(newTrade)
        // set the active trade to null
        this.currentTrade = null
    }
   
    toString() {
        return `Hello, Im ${this.name}! I am trading ${this.tradingPermission}!`;
    }
}