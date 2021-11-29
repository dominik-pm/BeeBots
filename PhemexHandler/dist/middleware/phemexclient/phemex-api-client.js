"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhemexClient = void 0;
const assert_1 = __importDefault(require("assert"));
const phemex_api_requests_1 = require("./phemex-api-requests");
const opt = {
    apiKey: 'asdasd',
    isLivenet: false,
    secret: 'sadsad'
};
class PhemexClient {
    // Query Product Information `GET /exchange/public/products`
    static async QueryProductInformation() {
        return await (0, phemex_api_requests_1.getRequest)("/exchange/public/products", undefined, opt);
    }
    // Trade API List `POST /orders`
    static async PlaceOrder(params, options = opt) {
        (0, assert_1.default)(params, "No params were passed");
        (0, assert_1.default)(params.symbol, "Parameter symbol is required");
        (0, assert_1.default)(params.clOrdID, "Parameter clOrdID is required");
        (0, assert_1.default)(params.side, "Parameter side is required");
        (0, assert_1.default)(params.orderQty, "Parameter orderQty is required");
        return await (0, phemex_api_requests_1.postRequest)("/orders", params, options);
    }
    // Amend order by orderID `POST /orders/replace`
    static async AmendOrderByOrderID(params, options = opt) {
        (0, assert_1.default)(params, "No params were passed");
        (0, assert_1.default)(params.symbol, "Parameter symbol is required");
        (0, assert_1.default)(params.orderID, "Parameter orderID is required");
        return await (0, phemex_api_requests_1.putRequest)("/orders/replace", params, options);
    }
    // Cancel Single Order `DELETE /orders/cancel`
    static async CancelSingleOrder(params, options = opt) {
        (0, assert_1.default)(params, "No params were passed");
        (0, assert_1.default)(params.symbol, "Parameter symbol is required");
        (0, assert_1.default)(params.orderID, "Parameter orderID is required");
        return await (0, phemex_api_requests_1.deleteRequest)("/orders/cancel", params, options);
    }
    // Bulk Cancel Orders `DELETE /orders/cancel`
    static async BulkCancelOrders(params, options = opt) {
        (0, assert_1.default)(params, "No params were passed");
        (0, assert_1.default)(params.symbol, "Parameter symbol is required");
        return await (0, phemex_api_requests_1.deleteRequest)("/orders", params, options);
    }
    // Cancel All Orders `DELETE /orders/all`
    static async CancelAllOrders(params, options = opt) {
        (0, assert_1.default)(params, "No params were passed");
        (0, assert_1.default)(params.symbol, "Parameter symbol is required");
        return await (0, phemex_api_requests_1.deleteRequest)("/orders/all", params, options);
    }
    // Query trading account and positions `GET /accounts/accountPositions`
    static async QueryTradingAccountAndPositions(params, options = opt) {
        (0, assert_1.default)(params, "No params were passed");
        (0, assert_1.default)(params.currency, "Parameter currency is required BTC, or USD");
        return await (0, phemex_api_requests_1.getRequest)("/accounts/accountPositions", params, options);
    }
    // Change leverage `PUT /positions/leverage`
    static async ChangeLeverage(params, options = opt) {
        (0, assert_1.default)(params, "No params were passed");
        (0, assert_1.default)(params.symbol, "Parameter symbol is required");
        (0, assert_1.default)(params.leverage, "Parameter leverage is required");
        return await (0, phemex_api_requests_1.putRequest)("/accounts/accountPositions", params, options);
    }
    // Change position risklimit `PUT /positions/leverage`
    static async ChangeRiskLimit(params, options = opt) {
        (0, assert_1.default)(params, "No params were passed");
        (0, assert_1.default)(params.symbol, "Parameter symbol is required");
        (0, assert_1.default)(params.riskLimit, "Parameter riskLimit is required");
        return await (0, phemex_api_requests_1.putRequest)("/positions/riskLimit", params, options);
    }
    // Assign position balance in isolated marign mode `POST  /positions/leverage`
    static async AssignPositionBalance(params, options = opt) {
        (0, assert_1.default)(params, "No params were passed");
        (0, assert_1.default)(params.posBalance, "Parameter posBalance is required");
        return await (0, phemex_api_requests_1.postRequest)("/positions/assign", params, options);
    }
    // Query open orders by symbol `GET /orders/activeList`
    static async QueryOpenOrdersBySymbol(params, options = opt) {
        (0, assert_1.default)(params, "No params were passed");
        (0, assert_1.default)(params.symbol, "Parameter symbol is required");
        return await (0, phemex_api_requests_1.getRequest)("/orders/activeList", params, options);
    }
    // Query closed orders by symbol `GET /exchange/order/list`
    static async QueryClosedOrdersBySymbol(params, options = opt) {
        (0, assert_1.default)(params, "No params were passed");
        (0, assert_1.default)(params.symbol, "Parameter symbol is required");
        return await (0, phemex_api_requests_1.getRequest)("/exchange/order/list", params, options);
    }
    //  Query user order by orderID or Query user order by client order ID `GET/exchange/order`
    static async QueryOrder(params, options = opt) {
        return await (0, phemex_api_requests_1.getRequest)("/exchange/order", params, options);
    }
    // Query user trade `GET /exchange/order/trade`
    static async QueryUserTrades(params, options = opt) {
        return await (0, phemex_api_requests_1.getRequest)("/exchange/order/trade", params, options);
    }
    // Query Order Book `GET /md/orderbook`
    static async QueryOrderBook(params, options = opt) {
        (0, assert_1.default)(params, "No params were passed");
        (0, assert_1.default)(params.symbol, "Parameter symbol is required");
        return await (0, phemex_api_requests_1.getRequest)("/md/orderbook", params, options);
    }
    // Query Recent Trades `GET /md/trade`
    static async QueryRecentTrades(params, options = opt) {
        (0, assert_1.default)(params, "No params were passed");
        (0, assert_1.default)(params.symbol, "Parameter symbol is required");
        return await (0, phemex_api_requests_1.getRequest)("/md/trade", params, options);
    }
    // Query 24 Hours Ticker `GET /md/trade`
    static async Query24HourTicker(params, options = opt) {
        (0, assert_1.default)(params, "No params were passed");
        (0, assert_1.default)(params.symbol, "Parameter symbol is required");
        return await (0, phemex_api_requests_1.getRequest)("/md/ticker/24hr", params, options);
    }
    // Query client and wallets `GET /phemex-user/users/children`
    static async QueryClientsAndWallets(params, options = opt) {
        return await (0, phemex_api_requests_1.getRequest)("/phemex-user/users/children", params, options);
    }
    // Wallet transfer Out `POST /exchange/wallets/transferOut`
    static async WalletTransferOut(params, options = opt) {
        (0, assert_1.default)(params, "No params were passed");
        (0, assert_1.default)(params.amount, "Parameter amount is required");
        (0, assert_1.default)(params.clientCnt, "Parameter clientCnt is required");
        (0, assert_1.default)(params.currency, "Parameter currency is required");
        return await (0, phemex_api_requests_1.postRequest)("/exchange/wallets/transferOut", params, options);
    }
    // Wallet transfer In `POST /exchange/wallets/transferIn`
    static async WalletTransferIn(params, options = opt) {
        (0, assert_1.default)(params, "No params were passed");
        (0, assert_1.default)(params.amountEv, "Parameter amountEv is required");
        (0, assert_1.default)(params.clientCnt, "Parameter clientCnt is required");
        (0, assert_1.default)(params.currency, "Parameter currency is required");
        return await (0, phemex_api_requests_1.postRequest)("/exchange/wallets/transferIn", params, options);
    }
    // Wallet transfer In `POST exchange/margins`
    static async TransferWalletAndTradingAccount(params, options = opt) {
        (0, assert_1.default)(params, "No params were passed");
        (0, assert_1.default)(params.moveOp, "Parameter moveOp is required");
        return await (0, phemex_api_requests_1.postRequest)("/exchange/margins", params, options);
    }
    // Query wallet/tradingaccount transfer history `GET /exchange/margins/transfer`
    static async QueryWalletOrTradingAccountHistory(params, options = opt) {
        return await (0, phemex_api_requests_1.getRequest)("/exchange/margins/transfer", params, options);
    }
    // Withdraw `POST /exchange/wallets/createWithdraw`
    static async RequestWithdraw(params, options = opt) {
        (0, assert_1.default)(params, "No params were passed");
        (0, assert_1.default)(params.otpCode, "Parameter otpCode is required");
        (0, assert_1.default)(params.address, "Parameter address is required");
        (0, assert_1.default)(params.amountEv, "Parameter amountEv is required");
        (0, assert_1.default)(params.currency, "Parameter currency is required");
        return await (0, phemex_api_requests_1.postRequest)("/exchange/wallets/createWithdraw", params, options);
    }
    // ConfirmWithdraw `GET /exchange/wallets/confirm/withdraw`
    static async ConfirmWithdraw(params, options = opt) {
        (0, assert_1.default)(params, "No params were passed");
        (0, assert_1.default)(params.code, "Parameter code is required");
        return await (0, phemex_api_requests_1.getRequest)("/exchange/wallets/confirm/withdraw", params, options);
    }
    // CancelWithdraw `GET /exchange/wallets/confirm/withdraw`
    static async CancelWithdraw(params, options = opt) {
        (0, assert_1.default)(params, "No params were passed");
        (0, assert_1.default)(params.id, "Parameter id is required");
        return await (0, phemex_api_requests_1.getRequest)("/exchange/wallets/cancelWithdraw", params, options);
    }
    // ListWithdraws `GET /exchange/wallets/withdrawList`
    static async ListWithdraws(params, options = opt) {
        (0, assert_1.default)(params.currency, "Parameter currency is required");
        return await (0, phemex_api_requests_1.getRequest)("/exchange/wallets/withdrawList", params, options);
    }
    // Withdraw Address Management `POST /exchange/wallets/createWithdrawAddress`
    static async WithdrawAddressManagement(params, options = opt) {
        (0, assert_1.default)(params, "No params were passed");
        (0, assert_1.default)(params.address, "Parameter address is required");
        (0, assert_1.default)(params.currency, "Parameter currency is required");
        (0, assert_1.default)(params.remark, "Parameter remark is required");
        return await (0, phemex_api_requests_1.postRequest)("/exchange/wallets/createWithdrawAddress", params, options);
    }
}
exports.PhemexClient = PhemexClient;
