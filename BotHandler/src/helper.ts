import { orderSide } from './@types/api/PhemexHandler'
import { Action } from './@types/Bot'

export const formatPrice = (originalPrice: number): number => {
    let price: number = Math.trunc(originalPrice*10)
    if (price % 10 < 2) {
        price = Math.trunc(price/10)
    } else if (price % 10 < 8) {
        price = Math.trunc(price/10) + 0.5
    } else {
        price = Math.trunc(price/10) + 1
    }
    return price
}

export function evAmountToBTCAmount(ev: number): number {
    return Math.trunc(ev) / 100000000
}
export function btcAmountToEvAmount(btcAmount: number): number {
    return Math.trunc(btcAmount * 100000000)
}

export const convertSideToAction = (side: orderSide): Action => {
    return side == 'Buy' ? 'short' : 'short'
}
export const convertActionToSide = (action: Action): orderSide => {
    return action == 'long' ? 'Buy' : 'Sell'
}