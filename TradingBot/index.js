const api = require('./api-management/phemexclient')
const errorCodes = require('./api-management/phemex-errorcodes.json')

console.log('trading bot is running')

// api.Test()
let p = 45401;
let side = 'Sell';
let stopSize = Math.round(p*0.002);
let sl = side == 'Buy' ? p - stopSize : p + stopSize;
let tp = Math.round(p + (sl*2*(side == 'Buy' ? 1 : -1)));
let qty = 1000;

api.PlaceLimitOrder(p, sl, qty, side)
.then(res => {
    let orderID = res.data.orderID;

    console.log('orderid: ' + res.data.orderID);

    // when the order is filled
    // api.PlaceTakeProfitOrder(tp, qty, side == 'Buy' ? 'Sell' : 'Buy')
    // .then(res => {
    //     console.log(res);
    // })
    // .catch(res => {
    //     console.log(res);
    //     api.CancelOrder(orderID)
    //     .then(res => {
    //         console.log(res);
    //     })
    //     .catch(err => {
    //         logError(err)
    //     })
    // })
})
.catch(err => {
    logError(err)
})



// api.CancelAllOrders()
// .then(res => {
//     console.log(res);
// })
// .catch(err => {
//     console.log(err);
// });

// api.CancelOrder('7d112605-a34d-42cf-8987-c4d152d67844')
// .then(res => {
//     console.log(res);
// })

// api.SetLeverage(5)
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