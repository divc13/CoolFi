import { Account } from 'near-api-js';

interface CrossChainSwapParams {
    accountId: string;
    exact_amount_in: string;
    defuse_asset_identifier_in: string;
    defuse_asset_identifier_out: string;
    function_access_key: string;
    network?: string;
}
interface CrossChainSwapAndWithdrawParams {
    exact_amount_in: string;
    defuse_asset_identifier_in: string;
    defuse_asset_identifier_out: string;
    destination_address: string;
    network?: string;
}

declare function crossChainSwap(params: CrossChainSwapParams): Promise<any>;
declare function withdrawFromDefuse(params: CrossChainSwapAndWithdrawParams): Promise<any>;

interface NearToken {
    name: string;
    symbol: string;
    decimals: number;
    balance: string;
    uiAmount: string;
    priceUsd: string;
    valueUsd: string;
    valueNear?: string;
}
interface WalletPortfolio {
    totalUsd: string;
    totalNear?: string;
    tokens: Array<NearToken>;
}
declare class WalletProvider {
    private accountId;
    private cache;
    private account;
    private keyStore;
    constructor(accountId: string);
    get(): Promise<string | null>;
    connect(): Promise<Account>;
    private fetchWithRetry;
    fetchPortfolioValue(): Promise<WalletPortfolio>;
    private fetchNearPrice;
    formatPortfolio(portfolio: WalletPortfolio): string;
    getFormattedPortfolio(): Promise<string>;
}

export { WalletProvider, crossChainSwap, withdrawFromDefuse };
