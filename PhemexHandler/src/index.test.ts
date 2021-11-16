const request = require('supertest');
const jwt = require('jsonwebtoken')
const app = require('./index')

const token = jwt.sign('testcases', process.env.ACCESS_TOKEN_SECRET)

const headers = {
    'Authorization': `Bearer ${token}`
}

describe('Authorization', () => {
    it('GET /marketdata --> authorization error', () => {
        return request(app)
            .get('/marketdata')
            .send({})
            .expect('Content-Type', /json/)
            .expect(401)
    })
})

describe('PhemexHandler Marketdata', () => {
    it('GET /marketdata --> validate response body', () => {
        return request(app)
            .get('/tradecall')
            .set(headers)
            .send({

            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toEqual(expect.objectContaining({
                    marketData: expect.any(Object),
                    currentPrice: expect.any(Number)
                }))
            })
    })
})