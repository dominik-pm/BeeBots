import assert from "assert";
import { PhemexRequestOptions } from "../../@types/request";
import { deleteRequest, getRequest, postRequest, putRequest } from "./phemex-api-requests";

const opt: PhemexRequestOptions = {
    apiKey: 'asdasd',
    isLivenet: false,
    secret: 'sadsad'
}

export class PhemexClient {
    // Query Product Information `GET /exchange/public/products`
    public static async QueryProductInformation() {
        return await getRequest("/exchange/public/products", undefined, opt);
    }

    // Trade API List `POST /orders`
    public static async PlaceOrder(params: any, options: PhemexRequestOptions = opt) {
        assert(params, "No params were passed");
        assert(params.symbol, "Parameter symbol is required");
        assert(params.clOrdID, "Parameter clOrdID is required");
        assert(params.side, "Parameter side is required");
        assert(params.orderQty, "Parameter orderQty is required");
        return await postRequest("/orders", params, options);
    }

    // Amend order by orderID `POST /orders/replace`
    public static async AmendOrderByOrderID(params: any, options: PhemexRequestOptions = opt) {
        assert(params, "No params were passed");
        assert(params.symbol, "Parameter symbol is required");
        assert(params.orderID, "Parameter orderID is required");
        return await putRequest("/orders/replace", params, options);
    }

    // Cancel Single Order `DELETE /orders/cancel`
    public static async CancelSingleOrder(params: any, options: PhemexRequestOptions = opt) {
        assert(params, "No params were passed");
        assert(params.symbol, "Parameter symbol is required");
        assert(params.orderID, "Parameter orderID is required");
        return await deleteRequest("/orders/cancel", params, options);
    }

    // Bulk Cancel Orders `DELETE /orders/cancel`
    public static async BulkCancelOrders(params: any, options: PhemexRequestOptions = opt) {
        assert(params, "No params were passed");
        assert(params.symbol, "Parameter symbol is required");
        return await deleteRequest("/orders", params, options);
    }

    // Cancel All Orders `DELETE /orders/all`
    public static async CancelAllOrders(params: any, options: PhemexRequestOptions = opt) {
        assert(params, "No params were passed");
        assert(params.symbol, "Parameter symbol is required");
        return await deleteRequest("/orders/all", params, options);
    }

    // Query trading account and positions `GET /accounts/accountPositions`
    public static async QueryTradingAccountAndPositions(params: any, options: PhemexRequestOptions = opt) {
        assert(params, "No params were passed");
        assert(params.currency, "Parameter currency is required BTC, or USD");
        return await getRequest("/accounts/accountPositions", params, options);
    }

    // Change leverage `PUT /positions/leverage`
    public static async ChangeLeverage(params: any, options: PhemexRequestOptions = opt) {
        assert(params, "No params were passed");
        assert(params.symbol, "Parameter symbol is required");
        assert(params.leverage, "Parameter leverage is required");
        return await putRequest("/accounts/accountPositions", params, options);
    }

    // Change position risklimit `PUT /positions/leverage`
    public static async ChangeRiskLimit(params: any, options: PhemexRequestOptions = opt) {
        assert(params, "No params were passed");
        assert(params.symbol, "Parameter symbol is required");
        assert(params.riskLimit, "Parameter riskLimit is required");
        return await putRequest("/positions/riskLimit", params, options);
    }

    // Assign position balance in isolated marign mode `POST  /positions/leverage`
    public static async AssignPositionBalance(params: any, options: PhemexRequestOptions = opt) {
        assert(params, "No params were passed");
        assert(params.posBalance, "Parameter posBalance is required");
        return await postRequest("/positions/assign", params, options);
    }

    // Query open orders by symbol `GET /orders/activeList`
    public static async QueryOpenOrdersBySymbol(params: any, options: PhemexRequestOptions = opt) {
        assert(params, "No params were passed");
        assert(params.symbol, "Parameter symbol is required");
        return await getRequest("/orders/activeList", params, options);
    }

    // Query closed orders by symbol `GET /exchange/order/list`
    public static async QueryClosedOrdersBySymbol(params: any, options: PhemexRequestOptions = opt) {
        assert(params, "No params were passed");
        assert(params.symbol, "Parameter symbol is required");
        return await getRequest("/exchange/order/list", params, options);
    }

    //  Query user order by orderID or Query user order by client order ID `GET/exchange/order`
    public static async QueryOrder(params: any, options: PhemexRequestOptions = opt) {
        return await getRequest("/exchange/order", params, options);
    }

    // Query user trade `GET /exchange/order/trade`
    public static async QueryUserTrades(params: any, options: PhemexRequestOptions = opt) {
        return await getRequest("/exchange/order/trade", params, options);
    }

    // Query Order Book `GET /md/orderbook`
    public static async QueryOrderBook(params: any, options: PhemexRequestOptions = opt) {
        assert(params, "No params were passed");
        assert(params.symbol, "Parameter symbol is required");
        return await getRequest("/md/orderbook", params, options);
    }

    // Query Recent Trades `GET /md/trade`
    public static async QueryRecentTrades(params: any, options: PhemexRequestOptions = opt) {
        assert(params, "No params were passed");
        assert(params.symbol, "Parameter symbol is required");
        return await getRequest("/md/trade", params, options);
    }

    // Query 24 Hours Ticker `GET /md/trade`
    public static async Query24HourTicker(params: any, options: PhemexRequestOptions = opt) {
        assert(params, "No params were passed");
        assert(params.symbol, "Parameter symbol is required");
        return await getRequest("/md/ticker/24hr", params, options);
    }

    // Query client and wallets `GET /phemex-user/users/children`
    public static async QueryClientsAndWallets(params: any, options: PhemexRequestOptions = opt) {
        return await getRequest("/phemex-user/users/children", params, options);
    }

    // Wallet transfer Out `POST /exchange/wallets/transferOut`
    public static async WalletTransferOut(params: any, options: PhemexRequestOptions = opt) {
        assert(params, "No params were passed");
        assert(params.amount, "Parameter amount is required");
        assert(params.clientCnt, "Parameter clientCnt is required");
        assert(params.currency, "Parameter currency is required");
        return await postRequest("/exchange/wallets/transferOut", params, options);
    }

    // Wallet transfer In `POST /exchange/wallets/transferIn`
    public static async WalletTransferIn(params: any, options: PhemexRequestOptions = opt) {
        assert(params, "No params were passed");
        assert(params.amountEv, "Parameter amountEv is required");
        assert(params.clientCnt, "Parameter clientCnt is required");
        assert(params.currency, "Parameter currency is required");
        return await postRequest("/exchange/wallets/transferIn", params, options);
    }

    // Wallet transfer In `POST exchange/margins`
    public static async TransferWalletAndTradingAccount(params: any, options: PhemexRequestOptions = opt) {
        assert(params, "No params were passed");
        assert(params.moveOp, "Parameter moveOp is required");
        return await postRequest("/exchange/margins", params, options);
    }

    // Query wallet/tradingaccount transfer history `GET /exchange/margins/transfer`
    public static async QueryWalletOrTradingAccountHistory(params: any, options: PhemexRequestOptions = opt) {
        return await getRequest("/exchange/margins/transfer", params, options);
    }

    // Withdraw `POST /exchange/wallets/createWithdraw`
    public static async RequestWithdraw(params: any, options: PhemexRequestOptions = opt) {
        assert(params, "No params were passed");
        assert(params.otpCode, "Parameter otpCode is required");
        assert(params.address, "Parameter address is required");
        assert(params.amountEv, "Parameter amountEv is required");
        assert(params.currency, "Parameter currency is required");
        return await postRequest("/exchange/wallets/createWithdraw", params, options);
    }

    // ConfirmWithdraw `GET /exchange/wallets/confirm/withdraw`
    public static async ConfirmWithdraw(params: any, options: PhemexRequestOptions = opt) {
        assert(params, "No params were passed");
        assert(params.code, "Parameter code is required");
        return await getRequest("/exchange/wallets/confirm/withdraw", params, options);
    }

    // CancelWithdraw `GET /exchange/wallets/confirm/withdraw`
    public static async CancelWithdraw(params: any, options: PhemexRequestOptions = opt) {
        assert(params, "No params were passed");
        assert(params.id, "Parameter id is required");
        return await getRequest("/exchange/wallets/cancelWithdraw", params, options);
    }

    // ListWithdraws `GET /exchange/wallets/withdrawList`
    public static async ListWithdraws(params: any, options: PhemexRequestOptions = opt) {
        assert(params.currency, "Parameter currency is required");
        return await getRequest("/exchange/wallets/withdrawList", params, options);
    }

    // Withdraw Address Management `POST /exchange/wallets/createWithdrawAddress`
    public static async WithdrawAddressManagement(params: any, options: PhemexRequestOptions = opt) {
        assert(params, "No params were passed");
        assert(params.address, "Parameter address is required");
        assert(params.currency, "Parameter currency is required");
        assert(params.remark, "Parameter remark is required");
        return await postRequest("/exchange/wallets/createWithdrawAddress", params, options);
    }

}