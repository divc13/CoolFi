import { DEPLOYMENT_URL } from "vercel-url";

interface RuntimeSettings {
    networkId: string;
    nodeUrl: string;
    accountId: string;
    secretKey: string;
    publicKey: string;
    SLIPPAGE: number;
    defuseContractId: string;
    coingeckoUrl: string;
}

function getRuntimeSettings(): RuntimeSettings {

    return {
        networkId: "mainnet",
        nodeUrl: `https://rpc.mainnet.near.org`,
        accountId: process.env.NEAR_ADDRESS || "",
        secretKey: process.env.NEAR_WALLET_SECRET_KEY || "",
        publicKey: process.env.NEAR_WALLET_PUBLIC_KEY || "",
        SLIPPAGE: process.env.NEAR_SLIPPAGE ? parseInt(process.env.NEAR_SLIPPAGE) : 1,
        defuseContractId: process.env.DEFUSE_CONTRACT_ID || "intents.near",
        coingeckoUrl: process.env.COINGECKO_API_URL || "",
    };
}

const ACCOUNT_ID = process.env.ACCOUNT_ID;
const settings = getRuntimeSettings();
settings.accountId = ACCOUNT_ID || "";

// Set the plugin url in order of BITTE_CONFIG, env, DEPLOYMENT_URL (used for Vercel deployments)
const PLUGIN_URL = DEPLOYMENT_URL || `${process.env.NEXT_PUBLIC_HOST || 'localhost'}:${process.env.PORT || 4000}`;

if (!PLUGIN_URL) {
  console.error(
    "!!! Plugin URL not found in env, BITTE_CONFIG or DEPLOYMENT_URL !!!"
  );
  process.exit(1);
}


export { ACCOUNT_ID, PLUGIN_URL, settings };
