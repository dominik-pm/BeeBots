const request = require('supertest')
const app = require('./index')
const jwt = require('jsonwebtoken')

const token = jwt.sign('testcases', process.env.ACCESS_TOKEN_SECRET)

const headers = {
    'Authorization': `Bearer ${token}`
}

describe('position update', () => {
    it('GET /positionupdate --> 400 if no currentPrice given', () => {
        return request(app)
            .get('/positionupdate')
            .set(headers)
            .send({})
            .expect(400)
    })
    it('GET /positionupdate --> 400 if currentPrice is of a bad type', () => {
        return request(app)
            .get('/positionupdate')
            .set(headers)
            .send({
                currentPrice: '46000'
            })
            .expect(400)
    })
    it('GET /positionupdate --> 400 if no entryPrice given', () => {
        return request(app)
            .get('/positionupdate')
            .set(headers)
            .send({
                currentPrice: 46000.5
            })
            .expect(400)
    })
    it('GET /positionupdate --> 400 if entryPrice is of a bad type', () => {
        return request(app)
            .get('/positionupdate')
            .set(headers)
            .send({
                currentPrice: 46000,
                entryPrice: '46000'
            })
            .expect(400)
    })
    it('GET /positionupdate --> 400 if no stopLoss given', () => {
        return request(app)
            .get('/positionupdate')
            .set(headers)
            .send({
                currentPrice: 46000,
                entryPrice: 46000
            })
            .expect(400)
    })
    it('GET /positionupdate --> 400 if stopLoss is of a bad type', () => {
        return request(app)
            .get('/positionupdate')
            .set(headers)
            .send({
                currentPrice: 46000,
                entryPrice: 46000,
                stopLoss: {stopLoss: 45000}
            })
            .expect(400)
    })
    it('GET /positionupdate --> 400 if originalstopLoss is not given', () => {
        return request(app)
            .get('/positionupdate')
            .set(headers)
            .send({
                currentPrice: 46000,
                entryPrice: 46000,
                stopLoss: 45000
            })
            .expect(400)
    })
    it('GET /positionupdate --> 400 if originalstopLoss is of a bad type', () => {
        return request(app)
            .get('/positionupdate')
            .set(headers)
            .send({
                currentPrice: 46000,
                entryPrice: 46000,
                stopLoss: 45000,
                originalstopLoss: "string"
            })
            .expect(400)
    })

    it('GET /positionupdate --> validates reponse body', () => {
        return request(app)
            .get('/positionupdate')
            .set(headers)
            .send({
                currentPrice: 46000,
                entryPrice: 46000,
                stopLoss: 45000,
                originalStopLoss: 45000,
                takeProfit: null
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toEqual(expect.objectContaining({
                    stopLoss: expect.any(Number),
                    takeProfit: expect.any(Number)
                }))
            })
    })

    // request()
    //     .expect('Content-Type', '/json/')
    //     .expect(200)
    //     .end(function(err, res) {
    //         if (err) throw err
    //     })
})

/*
describe('Algo specific response 1RAON', () => {
    it('GET /positionupdate --> validate 1:1 short takeprofit (44000)', () => {
        return request(app)
            .get('/positionupdate')
            .set(headers)
            .send({
                currentPrice: 44500,
                entryPrice: 45000,
                stopLoss: 46000
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toEqual(expect.objectContaining({
                    stopLoss: expect.any(Number),
                    takeProfit: 44000
                }))
            })
    })

    it('GET /positionupdate --> validate 1:1 long takeprofit (46000)', () => {
        return request(app)
            .get('/positionupdate')
            .set(headers)
            .send({
                currentPrice: 45500,
                entryPrice: 45000,
                stopLoss: 44000
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toEqual(expect.objectContaining({
                    stopLoss: expect.any(Number),
                    takeProfit: 46000
                }))
            })
    })

    it('GET /positionupdate --> validate takeprofit stays (46000)', () => {
        return request(app)
            .get('/positionupdate')
            .set(headers)
            .send({
                currentPrice: 45500,
                entryPrice: 45000,
                stopLoss: 44000,
                takeProfit: 48000
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toEqual(expect.objectContaining({
                    stopLoss: expect.any(Number),
                    takeProfit: 46000
                }))
            })
    })
})
*/

/*
describe('Algo specific response 2RAON', () => {
    it('GET /positionupdate --> validate 2:1 short takeprofit (43000)', () => {
        return request(app)
            .get('/positionupdate')
            .set(headers)
            .send({
                currentPrice: 44500,
                entryPrice: 45000,
                stopLoss: 46000
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toEqual(expect.objectContaining({
                    stopLoss: expect.any(Number),
                    takeProfit: 43000
                }))
            })
    })

    it('GET /positionupdate --> validate 2:1 long takeprofit (47000)', () => {
        return request(app)
            .get('/positionupdate')
            .set(headers)
            .send({
                currentPrice: 46000,
                entryPrice: 45000,
                stopLoss: 44000
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toEqual(expect.objectContaining({
                    stopLoss: expect.any(Number),
                    takeProfit: 47000
                }))
            })
    })

    it('GET /positionupdate --> validate takeprofit stays (47000)', () => {
        return request(app)
            .get('/positionupdate')
            .set(headers)
            .send({
                currentPrice: 46500,
                entryPrice: 45000,
                stopLoss: 44000,
                takeProfit: 48000
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toEqual(expect.objectContaining({
                    stopLoss: expect.any(Number),
                    takeProfit: 47000
                }))
            })
    })
})
*/

/*
describe('Algo specific response 3RAON', () => {
    it('GET /positionupdate --> validate 3:1 short takeprofit (42000)', () => {
        return request(app)
            .get('/positionupdate')
            .set(headers)
            .send({
                currentPrice: 44500,
                entryPrice: 45000,
                stopLoss: 46000
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toEqual(expect.objectContaining({
                    stopLoss: expect.any(Number),
                    takeProfit: 42000
                }))
            })
    })

    it('GET /positionupdate --> validate 3:1 long takeprofit (48000)', () => {
        return request(app)
            .get('/positionupdate')
            .set(headers)
            .send({
                currentPrice: 45500,
                entryPrice: 45000,
                stopLoss: 44000
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toEqual(expect.objectContaining({
                    stopLoss: expect.any(Number),
                    takeProfit: 48000
                }))
            })
    })

    it('GET /positionupdate --> validate takeprofit stays (48000)', () => {
        return request(app)
            .get('/positionupdate')
            .set(headers)
            .send({
                currentPrice: 47500,
                entryPrice: 45000,
                stopLoss: 44000,
                takeProfit: 50000
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toEqual(expect.objectContaining({
                    stopLoss: expect.any(Number),
                    takeProfit: 48000
                }))
            })
    })
})
*/

/*
describe('Algo specific response 2RBE1', () => {
    it('GET /positionupdate --> validate 2:1 short takeprofit (43000)', () => {
        return request(app)
            .get('/positionupdate')
            .set(headers)
            .send({
                currentPrice: 45500,
                entryPrice: 45000,
                originalStopLoss: 46000,
                stopLoss: 46000
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toEqual(expect.objectContaining({
                    stopLoss: expect.any(Number),
                    takeProfit: 43000
                }))
            })
    })

    it('GET /positionupdate --> validate 2:1 long takeprofit (47000)', () => {
        return request(app)
            .get('/positionupdate')
            .set(headers)
            .send({
                currentPrice: 46000,
                entryPrice: 45000,
                originalStopLoss: 44000,
                stopLoss: 44000
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toEqual(expect.objectContaining({
                    stopLoss: expect.any(Number),
                    takeProfit: 47000
                }))
            })
    })

    it('GET /positionupdate --> validate takeprofit and stoploss stays', () => {
        return request(app)
            .get('/positionupdate')
            .set(headers)
            .send({
                currentPrice: 45500,
                entryPrice: 45000,
                stopLoss: 45000,
                originalStopLoss: 44000,
                takeProfit: 48000
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toEqual(expect.objectContaining({
                    stopLoss: 45000,
                    takeProfit: 47000
                }))
            })
    })

    it('GET /positionupdate --> validate stoploss changes (45000)', () => {
        return request(app)
            .get('/positionupdate')
            .set(headers)
            .send({
                currentPrice: 46000,
                entryPrice: 45000,
                stopLoss: 44000,
                originalStopLoss: 44000,
                takeProfit: 47000
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toEqual(expect.objectContaining({
                    stopLoss: 45000,
                    takeProfit: 47000
                }))
            })
    })
})
*/

/*
describe('Algo specific response 3RBE1', () => {
    it('GET /positionupdate --> validate 3:1 short takeprofit (42000)', () => {
        return request(app)
            .get('/positionupdate')
            .set(headers)
            .send({
                currentPrice: 45500,
                entryPrice: 45000,
                originalStopLoss: 46000,
                stopLoss: 46000
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toEqual(expect.objectContaining({
                    stopLoss: expect.any(Number),
                    takeProfit: 42000
                }))
            })
    })

    it('GET /positionupdate --> validate 3:1 long takeprofit (48000)', () => {
        return request(app)
            .get('/positionupdate')
            .set(headers)
            .send({
                currentPrice: 46000,
                entryPrice: 45000,
                originalStopLoss: 44000,
                stopLoss: 44000
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toEqual(expect.objectContaining({
                    stopLoss: expect.any(Number),
                    takeProfit: 48000
                }))
            })
    })

    it('GET /positionupdate --> validate takeprofit and stoploss stays', () => {
        return request(app)
            .get('/positionupdate')
            .set(headers)
            .send({
                currentPrice: 45500,
                entryPrice: 45000,
                stopLoss: 45000,
                originalStopLoss: 44000,
                takeProfit: 47000
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toEqual(expect.objectContaining({
                    stopLoss: 45000,
                    takeProfit: 48000
                }))
            })
    })

    it('GET /positionupdate --> validate stoploss changes (45000)', () => {
        return request(app)
            .get('/positionupdate')
            .set(headers)
            .send({
                currentPrice: 46000,
                entryPrice: 45000,
                stopLoss: 44000,
                originalStopLoss: 44000
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toEqual(expect.objectContaining({
                    stopLoss: 45000,
                    takeProfit: 48000
                }))
            })
    })
})
*/