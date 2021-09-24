const orderHandler = require('./api-management/order-handler')
const errorCodes = require('./api-management/errorcodes.json')
const chartData = require('./api-management/chartdata-handler')

console.log('trading bot is running')

// orderHandler.Test()
let p = 43500;
let side = 'Buy';
let stopSize = Math.round(p*0.002);
let sl = side == 'Buy' ? p - stopSize : p + stopSize;
let tp = Math.round(p + (sl*2*(side == 'Buy' ? 1 : -1)));
let qty = 1000;

chartData.GetPriceData();

// orderHandler.GetMarketAnalysis()
// .then(res => {
//     console.log(res);
// })
// .catch(err => {
//     logError(err);
// })

// orderHandler.PlaceLimitOrder(p, sl, qty, side)
// .then(res => {
//     let orderID = res.data.orderID;

//     console.log('orderid: ' + res.data.orderID);

//     // when the order is filled
//     // orderHandler.PlaceTakeProfitOrder(tp, qty, side == 'Buy' ? 'Sell' : 'Buy')
//     // .then(res => {
//     //     console.log(res);
//     // })
//     // .catch(res => {
//     //     console.log(res);
//     //     orderHandler.CancelOrder(orderID)
//     //     .then(res => {
//     //         console.log(res);
//     //     })
//     //     .catch(err => {
//     //         logError(err)
//     //     })
//     // })
// })
// .catch(err => {
//     logError(err)
// })


// orderHandler.CancelAllOrders()
// .then(res => {
//     console.log(res);
// })
// .catch(err => {
//     console.log(err);
// });

// orderHandler.CancelOrder('a32fc277-0aea-43a0-83ac-7a6b93e0e780')
// .then(res => {
//     console.log(res);
// })
// .catch(err => {
//     logError(err);
// })

// orderHandler.SetLeverage(5)
// .then(res => {
//     console.log('changed leverage: ');
//     console.log(res);
// })
// .catch(err => {
//     console.log("errorcode: " + err);
//     if (errorCodes[err]) {
//         console.log(errorCodes[err].message);
//         console.log(errorCodes[err].details);
//     }
// })

function logError(errorCode) {
    console.error("Error occurred: " + errorCode);
    if (errorCodes[errorCode]) {
        console.log("   - " + errorCodes[errorCode].message);
        console.log("   - " + errorCodes[errorCode].details);
    } else {
        console.log("no details with that error code");
    }
}