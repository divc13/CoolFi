import { DEPLOYMENT_URL } from "vercel-url";
import "dotenv/config";

interface RuntimeSettings {
    networkId: string;
    nodeUrl: string;
    SLIPPAGE: number;
    defuseContractId: string;
    defuseRPCUrl: string;
    coingeckoUrl: string;
    polling_interval_ms: number;
    max_polling_time_ms: number;
    ft_minimum_storage_balance_large: string;
    bitteApiKey: string;
    bitteApiUrl: string;
    twitterUsername: string;
    twitterPassword: string;
    twitterEmail: string;
    twitterApiKey: string;
    twitterApiSecretKey: string;
    twitterAccessToken: string;
    twitterAccessTokenSecret: string;
    crypto_api_key:string;
    zcash_fee: number;
}

function getRuntimeSettings(): RuntimeSettings {

    const requiredEnvVars = [
        "TWITTER_USERNAME",
        "TWITTER_PASSWORD",
        "TWITTER_EMAIL",
        "TWITTER_API_KEY",
        "TWITTER_API_SECRET_KEY",
        "TWITTER_ACCESS_TOKEN",
        "TWITTER_ACCESS_TOKEN_SECRET",
        "BITTE_API_KEY",
        "BITTE_API_URL",
        "CRYPTO_API_KEY",
    ];

    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            console.log(`Missing environment variable: ${envVar}`);
            throw new Error(`Missing environment variable: ${envVar}`);
        }
    }

    return {
        networkId: "mainnet",
        nodeUrl: `https://rpc.mainnet.near.org`,
        polling_interval_ms: Number(process.env.POLLING_INTERVAL_MS) || 2000,
        max_polling_time_ms: Number(process.env.MAX_POLLING_TIME_MS) || 30000,
        zcash_fee: Number(process.env.ZCASH_FEE) || 0.0001,
        ft_minimum_storage_balance_large: process.env.FT_MINIMUM_STORAGE_BALANCE_LARGE || "1250000000000000000000",
        defuseRPCUrl: process.env.DEFUSE_RPC_URL || "https://solver-relay-v2.chaindefuser.com/rpc",
        SLIPPAGE: process.env.NEAR_SLIPPAGE ? parseInt(process.env.NEAR_SLIPPAGE) : 1,
        defuseContractId: process.env.DEFUSE_CONTRACT_ID || "intents.near",
        coingeckoUrl: process.env.COINGECKO_API_URL || "",
        bitteApiKey: process.env.BITTE_API_KEY || "",
        bitteApiUrl: process.env.BITTE_API_URL || "",
        twitterUsername: process.env.TWITTER_USERNAME || "",
        twitterPassword: process.env.TWITTER_PASSWORD || "",
        twitterEmail: process.env.TWITTER_EMAIL || "",
        twitterApiKey: process.env.TWITTER_API_KEY || "",
        twitterApiSecretKey: process.env.TWITTER_API_SECRET_KEY || "",
        twitterAccessToken: process.env.TWITTER_ACCESS_TOKEN || "",
        twitterAccessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || "",
        crypto_api_key: process.env.CRYPTO_API_KEY || "",
    };
}

const ACCOUNT_ID = process.env.ACCOUNT_ID;
const settings = getRuntimeSettings();

// Set the plugin url in order of BITTE_CONFIG, env, DEPLOYMENT_URL (used for Vercel deployments)
const PLUGIN_URL = DEPLOYMENT_URL || `${process.env.NEXT_PUBLIC_HOST || 'localhost'}:${process.env.PORT || 4000}`;



if (!PLUGIN_URL) {
  console.error(
    "!!! Plugin URL not found in env, BITTE_CONFIG or DEPLOYMENT_URL !!!"
  );
  process.exit(1);
}


export { ACCOUNT_ID, PLUGIN_URL, settings };
