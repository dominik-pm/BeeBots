import { getRProfit } from '../index'
import { ActiveTrade, BotAccountInfo, RiskProfile, TradingPermission, Transaction } from '../@types/Bot'
import { openPosition, updateStopLoss, updateTakeProfit } from './Actions'
import { getTradeCall } from '../api/BuyAlgo'
import { getPositionUpdate } from '../api/PositionAlgo'
import * as _ from 'lodash'
import { MarketDataResponse } from '../@types/api/PhemexHandler'
import { closeAll } from '../api/PhemexHandler'

const defaultRiskProfile: RiskProfile = {
    tradeThreshhold: 0.5,           // minimum confidence to execute a trade
    capitalRiskPerTrade: 0.02,      // percentag of total capital to risk per trade
    stopLossDistance: 0.001         // percentage from the current price to the stoploss
}

export default class Bot {
    authToken: string
    name: string
    tradingPermission: TradingPermission
    currentTrade: ActiveTrade | null // TODO: maybe add risk amount to position (can vary when trading on phemex) -> to calculate R-profit
    tradeHistory: Transaction[]
    riskProfile: RiskProfile
    id: number
    buyAlgo: number
    positionAlgo: number
    phemexAccountInfo: BotAccountInfo = {
        activeLimitEntryOrderID: null,
        entryOrderID: null,
        balance: 0,
        entryPnl: 0
    }

    constructor(id: number, token: string, tradingPermission: TradingPermission, name: string, buyAlgo: number, positionAlgo: number, riskProfile = defaultRiskProfile, currentTrade: ActiveTrade | null = null) {
        this.id = id
        this.authToken = token
        this.tradingPermission = tradingPermission
        this.name = name
        this.buyAlgo = buyAlgo
        this.positionAlgo = positionAlgo
        this.currentTrade = currentTrade
        this.tradeHistory = []
        this.riskProfile = riskProfile
    }

    decideAction(marketData: MarketDataResponse) {
        const { currentPrice } = marketData

        if (!this.currentTrade) {
            // looking for a trade
            getTradeCall(this.authToken, marketData, this.buyAlgo)
            .then(res => {
                this.log(res)
                if (res.confidence > this.riskProfile.tradeThreshhold) {
                    openPosition(this, res.action, this.riskProfile.stopLossDistance)
                }
            })
            .catch(err => {
                console.log('Can not get tradecall:')
                this.log(err)
            })
        } else {
            // currently in a trade
            
            this.log(
                'current position:',
                {entryPrice: this.currentTrade.entryPrice, stopLoss: this.currentTrade.stopLoss, takeProfit: this.currentTrade.takeProfit},
                'current r profit:', getRProfit(this.currentTrade.entryPrice, this.currentTrade.originalStopLoss || this.currentTrade.entryPrice, currentPrice)
            )
            
            getPositionUpdate(this.authToken, this.currentTrade, currentPrice, this.positionAlgo)
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
                this.log(
                    'Can not get positionupdate:',
                    err,
                    '---> closing position'
                )
                closeAll(this.authToken)
                .then(res => {
                    this.log('closed all')
                })
                .catch(err => {
                    this.log(err)
                })
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
        if (_.isEqual(this.currentTrade, newPosition)) return

        this.currentTrade = newPosition

        this.log(
            'positon update:',
            {stopLoss: newPosition.stopLoss, takeProfit: newPosition.takeProfit}
        )
    }

    closedPosition(percentageProfit: number, rProfit: number, exitPrice: number): Transaction | null {
        if (!this.currentTrade) {
            return null
        }

        this.currentTrade.exitPrice = exitPrice

        let newTrade: Transaction = {
            entryPrice: this.currentTrade.entryPrice,
            exitPrice: this.currentTrade.exitPrice,
            stopLoss: this.currentTrade.stopLoss,
            target: this.currentTrade.takeProfit,
            action: this.currentTrade.side,
            percentageProfit,
            profit: rProfit,
            exitTime: new Date().toISOString()
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