// npm install tardis-dev
const tardis = require('tardis-dev')
const { streamNormalized, normalizeTrades, normalizeBookChanges } = tardis
// const { replay } = tardis

export let livePrice: number = 0

export function startLiveData() {
    getRealTimeData()
}

async function getRealTimeData() {
    const messages = streamNormalized(
        {
            exchange: 'phemex',
            symbols: ['BTCUSD']
        },
        normalizeTrades,
        normalizeBookChanges
    )

    for await (const message of messages) {
        
        if (message.type == 'trade') {
            livePrice = message.price
        }

    }
}

function priceEpToPrice(priceEp: number) {
    return priceEp / 10000
}