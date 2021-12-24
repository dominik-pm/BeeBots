import { getRProfit } from '../index'
import { ActiveTrade, RiskProfile, TradingPermission, Transaction } from '../@types/Bot'
import { openPosition, updateStopLoss, updateTakeProfit } from './Actions'
import { getTradeCall } from '../api/BuyAlgo'
import { getPositionUpdate } from '../api/PositionAlgo'

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
    id: number

    constructor(id: number, token: string, tradingPermission: TradingPermission, name: string, riskProfile = defaultRiskProfile, currentTrade: ActiveTrade | null = null) {
        this.id = id
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
                this.log(res)
                if (res.confidence > this.riskProfile.tradeThreshhold) {
                    openPosition(this, res.action, this.riskProfile.stopLossDistance)
                }
            })
            .catch(err => {
                this.log(err)
            })
        } else {
            // currently in a trade
            
            this.log(
                'current position:',
                {entryPrice: this.currentTrade?.entryPrice, stopLoss: this.currentTrade?.stopLoss, takeProfit: this.currentTrade?.takeProfit},
                'current r profit:', getRProfit(this.currentTrade.entryPrice, this.currentTrade.originalStopLoss, currentPrice)
            )
            
            getPositionUpdate(this.authToken, this.currentTrade, currentPrice)
            .then(res => {
                if (!this.currentTrade) {
                    return // position is closed, while the api request got fulfilled
                }


                if (res.stopLoss != this.currentTrade.stopLoss) {
                    updateStopLoss(this, this.currentTrade, res.stopLoss)
                }

                if (res.takeProfit != this.currentTrade.takeProfit) {
                    updateTakeProfit(this, this.currentTrade, res.takeProfit)
                }
            })
            .catch(err => {
                this.log(err)
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

        this.log(
            'positon update:',
            {stopLoss: newPosition.stopLoss, takeProfit: newPosition.takeProfit}
        )
    }

    closedPosition(profit: number, exitPrice: number): Transaction | null {
        if (!this.currentTrade) {
            return null
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

        return newTrade
    }
   
    toString() {
        return `Hello, Im ${this.name}! I am trading ${this.tradingPermission}!`;
    }

    log(...msg: any) {
        console.log(` --- ${this.name} --->`)
        for (const m of msg) {
            console.log(m)
        }
        console.log(` <---  ---`)
    }
}