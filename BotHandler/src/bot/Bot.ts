import { ActiveTrade, RiskProfile, TradingPermission, Transaction } from '../@types/Bot'
import { getPositionUpdate, getTradeCall } from '../api/Api'
import { openPosition, updateStopLoss, updateTakeProfit } from './Actions'

const defaultRiskProfile: RiskProfile = {
    tradeThreshhold: 0.5,           // minimum confidence to execute a trade
    capitalRiskPerTrade: 0.02,      // percentag of total capital to risk per trade
    stopLossDistance: 0.001         // percentage from the current price to the stoploss
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
        const { currentPrice, marketData } = data

        if (!this.currentTrade) {
            // looking for a trade
            getTradeCall(this.authToken, data)
            .then(res => {
                console.log(res)
                if (res.confidence > this.riskProfile.tradeThreshhold) {
                    openPosition(this, res.action, this.riskProfile.stopLossDistance)
                }
            })
            .catch(err => {
                console.log(err)
            })
        } else {
            // currently in a trade
            getPositionUpdate(this.authToken, this.currentTrade, currentPrice)
            .then(res => {
                console.log('current price: ' + currentPrice)
                console.log('current position:')
                console.log({stopLoss: this.currentTrade?.stopLoss, takeProfit: this.currentTrade?.takeProfit})

                if (!this.currentTrade) {
                    throw('cant be throwed, but typescript wants me to write this')
                }

                if (res.stopLoss != this.currentTrade.stopLoss) {
                    updateStopLoss(this, this.currentTrade, res.stopLoss)
                }

                if (res.takeProfit != this.currentTrade.takeProfit) {
                    updateTakeProfit(this, this.currentTrade, res.takeProfit)
                }
            })
            .catch(err => {
                console.log(err)
            })
        }

    }

    openedPosition(entry: number, side: 'long' | 'short' , stopLoss: number, takeProfit: number | null = null) {
        this.currentTrade = {
            entryPrice: entry,
            exitPrice: null,
            isFilled: true,
            side,
            stopLoss,
            originalStopLoss: stopLoss,
            takeProfit
        }
    }

    updatedPosition(newPosition: ActiveTrade) {
        this.currentTrade = newPosition

        console.log('positon update:')
        console.log({stopLoss: newPosition.stopLoss, takeProfit: newPosition.takeProfit})
    }

    closedPosition(profit: number, exitPrice: number) {
        if (!this.currentTrade) {
            return
        }

        this.currentTrade.exitPrice = exitPrice

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