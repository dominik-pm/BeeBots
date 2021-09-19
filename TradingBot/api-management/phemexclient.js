/* TESTNET API KEY */
/*
id:
    28852450-ca2e-439f-82cd-32082be63390
secret:
    g738_o74vwOA7v1Aiw6cxEgvbHlWp7rUYUtMLFUN3Xc2ZjgzYzgxZS0yODc0LTQ4NTUtODVkOS1lZmM4OWI2NDQ1MjE
*/
const { PhemexClient } = require("phemex-api");

const ApiKey = "28852450-ca2e-439f-82cd-32082be63390";
const apiSecret = "g738_o74vwOA7v1Aiw6cxEgvbHlWp7rUYUtMLFUN3Xc2ZjgzYzgxZS0yODc0LTQ4NTUtODVkOS1lZmM4OWI2NDQ1MjE";

const client = new PhemexClient(ApiKey, apiSecret);

function SetLeverage(leverage) {
    return client.ChangeLeverage({symbol: "BTCUSD", leverage})
}

function PlaceLimitOrder(orderPrice, stopLoss, quantity, side) {
    let priceEp = orderPrice*10000;
    let stopLossEp = stopLoss*10000;
    let orderQty = quantity;

    return client.PlaceOrder(
        {
            "actionBy": "FromOrderPlacement",
            "symbol": "BTCUSD",
            "clOrdID": "uuid-1573058952273",
            "side": side,
            "orderQty": orderQty,
            "priceEp": priceEp,
            "stopLossEp": stopLossEp,
            // "takeProfitEp": takeProfitEp, // not because this is a conditional order
            "ordType": "Limit",
            "reduceOnly": false,
            "triggerType": "ByLastPrice",
            "timeInForce": "GoodTillCancel"
            // "pegPriceType": "UNSPECIFIED", // trailing
            // "pegOffsetValueEp": 0,
        }
    )
}
function PlaceTakeProfitOrder(orderPrice, quantity, side = 'Buy') {
    if (side != 'Buy' && side != 'Sell') {
        console.log('No side specified! (Buy/Sell)');
        return;
    }

    let priceEp = orderPrice*10000;
    let orderQty = quantity;

    return client.PlaceOrder(
        {
            "actionBy": "FromOrderPlacement",
            "symbol": "BTCUSD",
            "clOrdID": "uuid-1573058952274",
            "side": side,
            "orderQty": orderQty,
            "priceEp": priceEp,
            "ordType": "Limit",
            "reduceOnly": true,
            "triggerType": "ByLastPrice",
            "timeInForce": "GoodTillCancel"
            // "pegPriceType": "UNSPECIFIED", // trailing
            // "pegOffsetValueEp": 0,
        }
    )
}

const CancelOrder = (orderId) => {
    return client.CancelSingleOrder(
        {
            symbol: "BTCUSD",
            orderID: orderId
        }
    )
}
function CancelAllOrders() {
    return client.CancelAllOrders({symbol: "BTCUSD"})
}

const Test = () => {
    client.QueryRecentTrades({symbol: "BTCUSD"})
    .then(result => console.log(result.result.trades))
    .catch(err => console.error(error))
}

module.exports = {
    Test, SetLeverage, PlaceLimitOrder, PlaceTakeProfitOrder, CancelOrder, CancelAllOrders
}