const assert = require("assert");
const Request = require("./phemex-client-requests");

class PhemexClient {
  constructor(apiKey, secret, livenet=false) {
    assert(apiKey, "Api Key is Required.");
    assert(secret, "Secret is Required.");

    this.request = new Request(...arguments);
  };

  // Query Product Information `GET /exchange/public/products`
  async QueryProductInformation() {
    return await this.request.getRequest("/exchange/public/products");
  };

  // Trade API List `POST /orders`
  async PlaceOrder(params) {
    assert(params, "No params were passed");
    assert(params.symbol, "Parameter symbol is required");
    assert(params.clOrdID, "Parameter clOrdID is required");
    assert(params.side, "Parameter side is required");
    assert(params.orderQty, "Parameter orderQty is required");
    return await this.request.postRequest("/orders", params);
  };

  // Amend order by orderID `POST /orders/replace`
  async AmendOrderByOrderID(params) {
    assert(params, "No params were passed");
    assert(params.symbol, "Parameter symbol is required");
    assert(params.orderID, "Parameter orderID is required");
    return await this.request.putRequest("/orders/replace", params);
  };

  // Cancel Single Order `DELETE /orders/cancel`
  async CancelSingleOrder(params) {
    assert(params, "No params were passed");
    assert(params.symbol, "Parameter symbol is required");
    assert(params.orderID, "Parameter orderID is required");
    return await this.request.deleteRequest("/orders/cancel", params);
  };

  // Bulk Cancel Orders `DELETE /orders/cancel`
  async BulkCancelOrders(params) {
    assert(params, "No params were passed");
    assert(params.symbol, "Parameter symbol is required");
    return await this.request.deleteRequest("/orders", params);
  };

  // Cancel All Orders `DELETE /orders/all`
  async CancelAllOrders(params) {
    assert(params, "No params were passed");
    assert(params.symbol, "Parameter symbol is required");
    return await this.request.deleteRequest("/orders/all", params);
  };

  // Query trading account and positions `GET /accounts/accountPositions`
  async QueryTradingAccountAndPositions(params) {
    assert(params, "No params were passed");
    assert(params.currency, "Parameter currency is required BTC, or USD");
    return await this.request.getRequest("/accounts/accountPositions", params);
  };

  // Change leverage `PUT /positions/leverage`
  async ChangeLeverage(params) {
    assert(params, "No params were passed");
    assert(params.symbol, "Parameter symbol is required");
    assert(params.leverage, "Parameter leverage is required");
    return await this.request.putRequest("/accounts/accountPositions", params);
  };

  // Change position risklimit `PUT /positions/leverage`
  async ChangeRiskLimit(params) {
    assert(params, "No params were passed");
    assert(params.symbol, "Parameter symbol is required");
    assert(params.riskLimit, "Parameter riskLimit is required");
    return await this.request.putRequest("/positions/riskLimit", params);
  };

  // Assign position balance in isolated marign mode `POST  /positions/leverage`
  async AssignPositionBalance(params) {
    assert(params, "No params were passed");
    assert(params.posBalance, "Parameter posBalance is required");
    return await this.request.postRequest("/positions/assign", params);
  };

  // Query open orders by symbol `GET /orders/activeList`
  async QueryOpenOrdersBySymbol(params) {
    assert(params, "No params were passed");
    assert(params.symbol, "Parameter symbol is required");
    return await this.request.getRequest("/orders/activeList", params);
  };

  // Query closed orders by symbol `GET /exchange/order/list`
  async QueryClosedOrdersBySymbol(params) {
    assert(params, "No params were passed");
    assert(params.symbol, "Parameter symbol is required");
    return await this.request.getRequest("/exchange/order/list", params);
  };

  //  Query user order by orderID or Query user order by client order ID `GET/exchange/order`
  async QueryOrder(params) {
    return await this.request.getRequest("/exchange/order", params);
  };

  // Query user trade `GET /exchange/order/trade`
  async QueryUserTrades(params) {
    return await this.request.getRequest("/exchange/order/trade", params);
  };

  // Query Order Book `GET /md/orderbook`
  async QueryOrderBook(params) {
    assert(params, "No params were passed");
    assert(params.symbol, "Parameter symbol is required");
    return await this.request.getRequest("/md/orderbook", params);
  };

  // Query Recent Trades `GET /md/trade`
  async QueryRecentTrades(params) {
    assert(params, "No params were passed");
    assert(params.symbol, "Parameter symbol is required");
    return await this.request.getRequest("/md/trade", params);
  };

  // Query 24 Hours Ticker `GET /md/trade`
  async Query24HourTicker(params) {
    assert(params, "No params were passed");
    assert(params.symbol, "Parameter symbol is required");
    return await this.request.getRequest("/md/ticker/24hr", params);
  };

  // Query client and wallets `GET /phemex-user/users/children`
  async QueryClientsAndWallets(params) {
    return await this.request.getRequest("/phemex-user/users/children", params);
  };

  // Wallet transfer Out `POST /exchange/wallets/transferOut`
  async WalletTransferOut(params) {
    assert(params, "No params were passed");
    assert(params.amount, "Parameter amount is required");
    assert(params.clientCnt, "Parameter clientCnt is required");
    assert(params.currency, "Parameter currency is required");
    return await this.request.postRequest("/exchange/wallets/transferOut", params);
  };

  // Wallet transfer In `POST /exchange/wallets/transferIn`
  async WalletTransferIn(params) {
    assert(params, "No params were passed");
    assert(params.amountEv, "Parameter amountEv is required");
    assert(params.clientCnt, "Parameter clientCnt is required");
    assert(params.currency, "Parameter currency is required");
    return await this.request.postRequest("/exchange/wallets/transferIn", params);
  };

  // Wallet transfer In `POST exchange/margins`
  async TransferWalletAndTradingAccount(params) {
    assert(params, "No params were passed");
    assert(params.moveOp, "Parameter moveOp is required");
    return await this.request.postRequest("/exchange/margins", params);
  };

  // Query wallet/tradingaccount transfer history `GET /exchange/margins/transfer`
  async QueryWalletOrTradingAccountHistory(params) {
    return await this.request.getRequest("/exchange/margins/transfer", params);
  };

  // Withdraw `POST /exchange/wallets/createWithdraw`
  async RequestWithdraw(params) {
    assert(params, "No params were passed");
    assert(params.otpCode, "Parameter otpCode is required");
    assert(params.address, "Parameter address is required");
    assert(params.amountEv, "Parameter amountEv is required");
    assert(params.currency, "Parameter currency is required");
    return await this.request.postRequest("/exchange/wallets/createWithdraw", params);
  };
  
  // ConfirmWithdraw `GET /exchange/wallets/confirm/withdraw`
  async ConfirmWithdraw(params) {
    assert(params, "No params were passed");
    assert(params.code, "Parameter code is required");
    return await this.request.getRequest("/exchange/wallets/confirm/withdraw", params);
  };

  // CancelWithdraw `GET /exchange/wallets/confirm/withdraw`
  async CancelWithdraw(params) {
    assert(params, "No params were passed");
    assert(params.id, "Parameter id is required");
    return await this.request.getRequest("/exchange/wallets/cancelWithdraw", params);
  };

  // ListWithdraws `GET /exchange/wallets/withdrawList`
  async ListWithdraws(params) {
    assert(params.currency, "Parameter currency is required");
    return await this.request.getRequest("/exchange/wallets/withdrawList", params);
  };

  // Withdraw Address Management `POST /exchange/wallets/createWithdrawAddress`
  async WithdrawAddressManagement(params) {
    assert(params, "No params were passed");
    assert(params.address, "Parameter address is required");
    assert(params.currency, "Parameter currency is required");
    assert(params.remark, "Parameter remark is required");
    return await this.request.postRequest("/exchange/wallets/createWithdrawAddress", params);
  };
}

module.exports = { PhemexClient };