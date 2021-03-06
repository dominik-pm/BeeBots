import request from 'supertest'
import jwt from 'jsonwebtoken'
import { app } from '../index'
import assert from 'assert'

const secret = process.env.ACCESS_TOKEN_SECRET
if (!secret) {
    throw('Could not load access token!')
}
const token = jwt.sign('testcases', secret)

const headers = {
    'Authorization': `Bearer ${token}`
}


// Phemex API Keys (Testnet) are encrypted
let payload = ({
    iv: '29c7b662eb1f8cd11a23cf5728d87973',
    encryptedData: '3e214052222c5a31741c7aff00f09c36609cfdb3ab8d2fe1b4a4038c57f783d6ea6b5dedae765c6f26d8741e6967e7cc34d342c5e8f7b89ed9336736c05209fece70af96860a50e2730b4707c174edf098223c80b944f8b0b3944535011ff60c5f24cd17e13d0edb380a07854bc475f74dce778d12015605ff06907910e804a14667455709c03b3d5666f11c42fb21f32d8708f768009f0d60038391a49ed5aa',
    isLivenet: false
});
// const token = jwt.sign(payload, secret)
// console.warn(token)
//const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpdiI6IjI5YzdiNjYyZWIxZjhjZDExYTIzY2Y1NzI4ZDg3OTczIiwiZW5jcnlwdGVkRGF0YSI6IjNlMjE0MDUyMjIyYzVhMzE3NDFjN2FmZjAwZjA5YzM2NjA5Y2ZkYjNhYjhkMmZlMWI0YTQwMzhjNTdmNzgzZDZlYTZiNWRlZGFlNzY1YzZmMjZkODc0MWU2OTY3ZTdjYzM0ZDM0MmM1ZThmN2I4OWVkOTMzNjczNmMwNTIwOWZlY2U3MGFmOTY4NjBhNTBlMjczMGI0NzA3YzE3NGVkZjA5ODIyM2M4MGI5NDRmOGIwYjM5NDQ1MzUwMTFmZjYwYzVmMjRjZDE3ZTEzZDBlZGIzODBhMDc4NTRiYzQ3NWY3NGRjZTc3OGQxMjAxNTYwNWZmMDY5MDc5MTBlODA0YTE0NjY3NDU1NzA5YzAzYjNkNTY2NmYxMWM0MmZiMjFmMzJkODcwOGY3NjgwMDlmMGQ2MDAzODM5MWE0OWVkNWFhIiwiaXNMaXZlbmV0IjpmYWxzZSwiaWF0IjoxNjMzODY4MTY3fQ.vhLoQDbsRZGOtXB1ZA3C7gn5kQGSdEtLfwBdFkuRSto'
/*
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpdiI6IjI5YzdiNjYyZWIxZjhjZDExYTIzY2Y1NzI4ZDg3OTczIiwiZW5jcnlwdGVkRGF0YSI6IjNlMjE0MDUyMjIyYzVhMzE3NDFjN2FmZjAwZjA5YzM2NjA5Y2ZkYjNhYjhkMmZlMWI0YTQwMzhjNTdmNzgzZDZlYTZiNWRlZGFlNzY1YzZmMjZkODc0MWU2OTY3ZTdjYzM0ZDM0MmM1ZThmN2I4OWVkOTMzNjczNmMwNTIwOWZlY2U3MGFmOTY4NjBhNTBlMjczMGI0NzA3YzE3NGVkZjA5ODIyM2M4MGI5NDRmOGIwYjM5NDQ1MzUwMTFmZjYwYzVmMjRjZDE3ZTEzZDBlZGIzODBhMDc4NTRiYzQ3NWY3NGRjZTc3OGQxMjAxNTYwNWZmMDY5MDc5MTBlODA0YTE0NjY3NDU1NzA5YzAzYjNkNTY2NmYxMWM0MmZiMjFmMzJkODcwOGY3NjgwMDlmMGQ2MDAzODM5MWE0OWVkNWFhIiwiaXNMaXZlbmV0IjpmYWxzZSwiaWF0IjoxNjMzODY4MTY3fQ.vhLoQDbsRZGOtXB1ZA3C7gn5kQGSdEtLfwBdFkuRSto
*/

describe('Phemex Handler API working', () => {

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

describe('PhemexHandler Marketdata', () => {
    it('GET /marketdata --> validate response body', () => {
        return request(app)
            .get('/marketdata')
            .set(headers)
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toEqual(expect.objectContaining({
                    marketData: expect.any(Object),
                    currentPrice: expect.any(Number)
                }))
            })
    })
    it('GET /marketdata --> authorization error', () => {
        return request(app).get('/marketdata').expect(401)
    })

    it('GET /price --> validate response body', () => {
        return request(app)
            .get('/price')
            .set(headers)
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => {
                expect(res.body).toEqual(expect.objectContaining({
                    currentPrice: expect.any(Number)
                }))
            })
    })
    it('GET /price --> authorization error', () => {
        return request(app).get('/price').expect(401)
    })
})