const request = require('supertest');
const app = require('./index')

describe('trade call', () => {
    it('GET /tradecall --> validate response body', () => {
        return request(app)
            .get('/tradecall')
            .send({

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