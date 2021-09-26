// npm install tardis-dev
const tardis = require('tardis-dev')
const { streamNormalized, normalizeTrades, normalizeBookChanges } = tardis
const { replay } = tardis;
const fs = require('fs');

async function GetRealTimeData() {
    const messages = streamNormalized(
        {
            exchange: 'bitmex',
            symbols: ['XBTUSD', 'ETHUSD']
        },
        normalizeTrades,
        normalizeBookChanges
    );

    for await (const message of messages) {
        console.log(message);
    }
}

async function GetPriceData() {
    try {
        let data = [];

        const messages = replay({
            exchange: 'phemex',
            from: '2021-09-01',
            to: '2021-09-02',
            filters: [{ channel: 'book', symbols: ['BTCUSD'] }],
            apiKey: '28852450-ca2e-439f-82cd-32082be63390'
        });

        // messages as provided by Phemex real-time stream
        let i = 0;
        let skip = false;

        for await (const { localTimestamp, message } of messages) {
            i++;
            if (skip || i % 100 == 0) { // every 100th -> ~5 sek interval
                if (message.book.bids.length == 0 && message.book.asks.length == 0) {
                    skip = true;
                } else {
                    skip = false
                    //console.log(localTimestamp);
                    //console.log(new Date(message.timestamp/1000000));
                    let price = 0;
                    if (message.book.bids[0]) {
                        //console.log(priceEpToPrice(message.book.bids[0][0]));
                        price = message.book.bids[0][0]
                    } else {
                        //console.log(priceEpToPrice(message.book.asks[0][0]));
                        price = message.book.asks[0][0]
                    }
                    //console.log();
                    data.push(
                        {
                            'timestamp': message.timestamp,
                            'price': priceEpToPrice(price)
                        }
                    );
                }
            }
        }

        console.log(data[0]);

        saveToDisk(data);

    } catch (e) {
        console.error(e);
    }
}

function saveToDisk(dataArray) {
    let data  = {
        data: dataArray
    }
    var json = JSON.stringify(data);
    fs.writeFile('chartdata.json', json, 'utf8', () => {
        console.log('successfully exported chart data!');
    });
}

function priceEpToPrice(priceEp) {
    return priceEp / 10000;
}

module.exports = {
    GetPriceData
}