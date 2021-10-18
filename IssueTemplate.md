# Interface:
## /tradecall
> to get a tradecall that says whether to 'Buy' or 'Sell' with the current market data

Request Data:
```javascript
{
    "currentPrice": Number,
    "marketData": {
        "longInterest": Number,
        "dailyHigh": Number,
        "dailyLow": Number
    }
}
```
Response Data:
```javascript
{
    "action": "Buy" | "Sell",
    "confidence": Number        // 0.0-1.0
}
```
todo
- [ ] implement a basic buyAlgo for testing
- [ ] implement more (complex) buyAlgos

test todo
- [ ] test response data + error codes
