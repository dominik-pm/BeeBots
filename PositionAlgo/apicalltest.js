const request = require('request');

const port = 8088;

const url = `http://localhost:${port}/positionupdate`;

const options = {
    url: url,
    method: 'GET',
    json: true,
    headers: {
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.bml4.JkNzt74YXAm0JKIiZ1aWunnBSoZYkA1TPmlp5QYcGMI'
    }
}

const data = {
    currentPrice: 44000,
    entryPrice: 45000,
    stopLoss: 46000,
    originalStopLoss: 46000,
    takeProfit: null
}

callPositionUpdate(options, data)
.then(res => {
    console.log(res);
})
.catch(res => {
    console.log(`status ${res.status}`);
    console.log(res.message);
})

function callPositionUpdate(options, data) {

    options.body = data;

    return new Promise((resolve, reject) => {
        request(options, (err, res, body) => {
            if (res.statusCode != 200) {
                if (!res.body) {
                    res.body = {status: res.statusCode, message: 'unknown error'}
                }

                reject(res.body);
            }

            resolve(body);
        });
    });
}