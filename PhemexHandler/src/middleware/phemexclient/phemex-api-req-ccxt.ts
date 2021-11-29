import ccxt from 'ccxt'; 

const exchange = new ccxt.phemex({
    apiKey: "28852450-ca2e-439f-82cd-32082be63390",
    secret: "g738_o74vwOA7v1Aiw6cxEgvbHlWp7rUYUtMLFUN3Xc2ZjgzYzgxZS0yODc0LTQ4NTUtODVkOS1lZmM4OWI2NDQ1MjE",
    options: {
        'defaultMarket': 'futures'
    }
})

if (exchange.urls['test']) {
    exchange.urls['api'] = exchange.urls['test']
}

export default async function testCcxt() {
    // return await exchange.fetchFreeBalance()
    return await exchange.fetchOpenOrders('BTC/USD')
}