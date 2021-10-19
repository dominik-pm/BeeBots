---
name: Task
about: Describe the task by its respective interfaces and the purpose. Also describe
  the test cases.
title: ''
labels: ''
assignees: ''

---

# Interfaces:
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
# Todo
- [ ] implement a basic buyAlgo for testing
- [ ] implement more (complex) buyAlgos

# Test cases
- [ ] test response data
- [ ] test error codes on wrong request data
