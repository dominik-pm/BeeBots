const request = require('supertest');
const jwt = require('jsonwebtoken')
const app = require('./index')

const token = jwt.sign('testcases', process.env.ACCESS_TOKEN_SECRET)

const headers = {
    'Authorization': `Bearer ${token}`
}

describe('Buy Algo API working', () => {

    it('GET / --> status 200 working', () => {
        return request(app)
            .get('/')
            .expect(200)
            .expect('Content-Type', /json/)
            .then((res) => {
                expect(res.body).toEqual(expect.objectContaining({
                    message: 'working'
                }))
            })
    })

})

describe('Buy Algo Authorization', () => {
    it('GET /tradecall --> authorization error', () => {
        return request(app).get('/tradecall').expect(401)
    })
})

describe('Buy Algo trade call', () => {
    it('GET /tradecall --> validate response body', () => {
        return request(app)
            .get('/tradecall')
            .set(headers)
            .send({
                close: 50001.5,
                fundingRate: 0.0001,
                high: 51162.5,
                indexPrice: 49974.5,
                low: 49700.5,
                markPrice: 49979.5,
                open: 50914.5,
                openInterest: 0,
                predFundingRate: 0.0001,
                symbol: "BTCUSD",
                timestamp: 1640508031074115600,
                turnover: 170192.7340135,
                volume: 8597963449,
                currentPrice: 50000
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toEqual(expect.objectContaining({
                    action: expect.any(String),
                    confidence: expect.any(Number)
                }))
                expect(['Buy', 'Sell']).toContain(res.body.action)
                expect(res.body.confidence).toBeGreaterThanOrEqual(0)
                expect(res.body.confidence).toBeLessThan(1)
            })
    })
})
