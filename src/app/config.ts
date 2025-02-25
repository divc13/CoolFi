import { DEPLOYMENT_URL } from "vercel-url";

interface RuntimeSettings {
    networkId: string;
    nodeUrl: string;
    secretKey: string;
    publicKey: string;
    SLIPPAGE: number;
    defuseContractId: string;
    defuseRPCUrl: string;
    coingeckoUrl: string;
    polling_interval_ms: number;
    max_polling_time_ms: number;
    ft_minimum_storage_balance_large: string;
}

function getRuntimeSettings(): RuntimeSettings {

    return {
        networkId: "mainnet",
        nodeUrl: `https://rpc.mainnet.near.org`,
        polling_interval_ms: Number(process.env.POLLING_INTERVAL_MS) || 2000,
        max_polling_time_ms: Number(process.env.MAX_POLLING_TIME_MS) || 30000,
        ft_minimum_storage_balance_large: process.env.FT_MINIMUM_STORAGE_BALANCE_LARGE || "1250000000000000000000",
        defuseRPCUrl: process.env.DEFUSE_RPC_URL || "https://solver-relay-v2.chaindefuser.com/rpc",
        secretKey: process.env.NEAR_WALLET_SECRET_KEY || "",
        publicKey: process.env.NEAR_WALLET_PUBLIC_KEY || "",
        SLIPPAGE: process.env.NEAR_SLIPPAGE ? parseInt(process.env.NEAR_SLIPPAGE) : 1,
        defuseContractId: process.env.DEFUSE_CONTRACT_ID || "intents.near",
        coingeckoUrl: process.env.COINGECKO_API_URL || "",
    };
}

const ACCOUNT_ID = process.env.ACCOUNT_ID;
const settings = getRuntimeSettings();

// Set the plugin url in order of BITTE_CONFIG, env, DEPLOYMENT_URL (used for Vercel deployments)
const PLUGIN_URL = DEPLOYMENT_URL || `${process.env.NEXT_PUBLIC_HOST || 'localhost'}:${process.env.PORT || 4000}`;
const CHAT_URL = DEPLOYMENT_URL || `${process.env.NEXT_PUBLIC_HOST || 'localhost'}:${process.env.CHAT_PORT || 3000}`;



if (!PLUGIN_URL) {
  console.error(
    "!!! Plugin URL not found in env, BITTE_CONFIG or DEPLOYMENT_URL !!!"
  );
  process.exit(1);
}


export { ACCOUNT_ID, PLUGIN_URL, CHAT_URL, settings };
