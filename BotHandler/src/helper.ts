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