import { connect, Near } from "near-api-js";
import { KeyPairString } from "near-api-js/lib/utils/key_pair";
import { utils } from "near-api-js";
import { keyStores } from "near-api-js";
import { createBatchDepositNearNep141Transaction, createBatchDepositNearNativeTransaction, getDepositedBalances,
    getNearNep141StorageBalance, sendNearTransaction, TokenBalances, FT_DEPOSIT_GAS, FT_TRANSFER_GAS } from "../utils/deposit";
import * as Borsh from "@dao-xyz/borsh";
import * as js_sha256 from "js-sha256";
import crypto from "crypto";
import { CrossChainSwapParams, createTokenDiffIntent, IntentMessage, IntentStatus,
     PublishIntentRequest, PublishIntentResponse, QuoteRequest, QuoteResponse,
     CrossChainSwapAndWithdrawParams, NativeWithdrawIntent} from "../types/intents";
import { KeyPair } from "near-api-js";
import { Payload, SignMessageParams } from "../types/intents";
import { providers } from "near-api-js";
import { getAllSupportedTokens, getDefuseAssetId, getTokenBySymbol, isTokenSupported, SingleChainToken, UnifiedToken, convertAmountToDecimals } from "../types/tokens";
import { settings } from "../utils/environment";
import { getTokenPriceUSD } from "../providers/coingeckoProvider";

const DEFUSE_RPC_URL = "https://solver-relay-v2.chaindefuser.com/rpc";

const POLLING_INTERVAL_MS = 2000; // 2 seconds
const MAX_POLLING_TIME_MS = 300000; // 5 minutes
const FT_MINIMUM_STORAGE_BALANCE_LARGE = "1250000000000000000000";
const SWAP_SAFETY_THRESHOLD_PERCENT_ABOVE_1USD = 0.5;
const SWAP_SAFETY_THRESHOLD_PERCENT_BELOW_1USD = 10;
const SWAP_SAFETY_THRESHOLD_USD = 1;

async function makeRPCRequest<T>(method: string, params: any[]): Promise<T> {
    const requestBody = {
        id: 1,
        jsonrpc: "2.0",
        method,
        params,
    };
    console.log("Making RPC request to:", DEFUSE_RPC_URL, method);
    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(DEFUSE_RPC_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        throw new Error(`RPC request failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.error) {
        throw new Error(`RPC error: ${data.error.message}`);
    }
    return data.result;
}
export const getQuote = async (params: QuoteRequest): Promise<QuoteResponse> => {
    return makeRPCRequest<QuoteResponse>("quote", [params]);
};

export const publishIntent = async (params: PublishIntentRequest): Promise<PublishIntentResponse> => {
    return makeRPCRequest<PublishIntentResponse>("publish_intent", [params]);
};

export const getIntentStatus = async (intentHash: string): Promise<IntentStatus> => {
    return makeRPCRequest<IntentStatus>("get_status", [{
        intent_hash: intentHash
    }]);
};


export const getCurrentBlock = async (): Promise<{ blockHeight: number }> => {
    try {
        const networkId = settings.networkId;
        const nodeUrl = settings.nodeUrl;

        const nearConnection = await connect({
            networkId,
            nodeUrl,
            headers: {}
        });

        // Get the latest block using finality: 'final' for the most recent finalized block
        const block = await nearConnection.connection.provider.block({
            finality: 'final'
        });

        return {
            blockHeight: block.header.height
        };
    } catch (error) {
        console.error("Error getting current block:", error);
        throw error;
    }
};


// First check the balance of the user, then deposit the tokens if there are any
export const depositIntoDefuse = async (tokenIds: string[], amount: bigint, nearConnection: Near) => {
    const contractId = tokenIds[0].replace('nep141:', '');

    const nep141balance = await getNearNep141StorageBalance({
        contractId,
        accountId: settings.accountId
    });

    // const publicKey = await nearConnection.connection.signer.getPublicKey(settings.accountId, settings.networkId);

    var transaction = null;
    if(contractId === "wrap.near")
    {
        transaction = createBatchDepositNearNativeTransaction(contractId, amount, !(nep141balance >= BigInt(FT_MINIMUM_STORAGE_BALANCE_LARGE)), BigInt(FT_MINIMUM_STORAGE_BALANCE_LARGE), amount > 0n, amount);
    }
    else
    {
        transaction = createBatchDepositNearNep141Transaction(contractId, amount, !(nep141balance >= BigInt(FT_MINIMUM_STORAGE_BALANCE_LARGE)), BigInt(FT_MINIMUM_STORAGE_BALANCE_LARGE));
    }

    return transaction;

    // for (const tx of transaction) {
    //     const result = await sendNearTransaction(nearConnection, settings.accountId, publicKey, contractId, tx);
    //     console.log("Transaction result:", result);
    // }
}


async function getBalances(
    tokens: (UnifiedToken | SingleChainToken)[],
    nearClient: providers.Provider,
    network?: string
): Promise<TokenBalances> {

    const tokenBalances = await getDepositedBalances(
        settings.accountId || "",
        tokens,
        nearClient,
        network
    );
    return tokenBalances;
}

async function pollIntentStatus(intentHash: string): Promise<IntentStatus> {
    const startTime = Date.now();

    while (Date.now() - startTime < MAX_POLLING_TIME_MS) {
        const status = await getIntentStatus(intentHash);

        if (status.status === "SETTLED" || status.status === "NOT_FOUND_OR_NOT_VALID") {
            return status;
        }

        await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
    }

    throw new Error("Timeout waiting for intent to settle");
}


async function signMessage(keyPair: KeyPair, params: SignMessageParams) {
    // Check the nonce is a 32bytes array
    if (params.nonce.byteLength !== 32) {
        throw Error("Expected nonce to be a 32 bytes buffer");
    }

    // Create the payload and sign it
    const payload = new Payload({ tag: 2147484061, message: params.message, nonce: Array.from(params.nonce), recipient: params.recipient});
    const borshPayload = Borsh.serialize(payload);
    const hashedPayload = js_sha256.sha256.array(borshPayload)
    const { signature } = keyPair.sign(Uint8Array.from(hashedPayload))

    return {
        signature: utils.serialize.base_encode(signature),
        publicKey: utils.serialize.base_encode(keyPair.getPublicKey().data)
    };
}

export async function crossChainSwap(params: CrossChainSwapParams): Promise<any> {

    const accountId = params.accountId;
    settings.accountId = accountId;
    const function_access_key = params.function_access_key;
    const network = params.network || "near";
    var transactions;


    if (!accountId) {
        throw new Error("NEAR_ADDRESS not configured");
    }

    console.log("Looking up tokens:", {
        tokenIn: params.defuse_asset_identifier_in,
        tokenOut: params.defuse_asset_identifier_out
    });

    // Get token details
    const defuseTokenIn = getTokenBySymbol(params.defuse_asset_identifier_in);
    const defuseTokenOut = getTokenBySymbol(params.defuse_asset_identifier_out);

    console.log("Found tokens:", {
        defuseTokenIn,
        defuseTokenOut
    });

    if (!defuseTokenIn || !defuseTokenOut) {
        const supportedTokens = getAllSupportedTokens();
        throw new Error(`Token ${params.defuse_asset_identifier_in} or ${params.defuse_asset_identifier_out} not found. Supported tokens: ${supportedTokens.join(', ')}`);
    }

    // Convert amount to proper decimals
    const amountInBigInt = convertAmountToDecimals(params.exact_amount_in, defuseTokenIn);

    // Get defuse asset IDs
    const defuseAssetIdIn = getDefuseAssetId(defuseTokenIn);
    const defuseAssetIdOut = getDefuseAssetId(defuseTokenOut, network);

    console.log("Defuse asset IDs:", {
        defuseAssetIdIn,
        defuseAssetIdOut
    });

    // Setup NEAR connection
    const keyStore = new keyStores.BrowserLocalStorageKeyStore();
    const keyPair = utils.KeyPair.fromString(function_access_key as KeyPairString);
    await keyStore.setKey(settings.networkId, settings.accountId, keyPair);

    const nearConnection = await connect({
        networkId: settings.networkId,
        keyStore,
        nodeUrl: settings.nodeUrl,
    });

    // Check balances
    const tokenBalanceIn = await getBalances([defuseTokenIn], nearConnection.connection.provider, network);
    const tokenBalanceOut = await getBalances([defuseTokenOut], nearConnection.connection.provider, network);
    console.log("Token balances:", tokenBalanceIn, tokenBalanceOut);

    if (tokenBalanceIn[defuseAssetIdIn] != undefined &&
        tokenBalanceIn[defuseAssetIdIn] < amountInBigInt) {
        transactions = await depositIntoDefuse([defuseAssetIdIn], amountInBigInt - tokenBalanceIn[defuseAssetIdIn], nearConnection);
    }
    // Get quote
    const quote = await getQuote({
        defuse_asset_identifier_in: defuseAssetIdIn,
        defuse_asset_identifier_out: defuseAssetIdOut,
        exact_amount_in: amountInBigInt.toString(),
    });
    console.log("Quote:", quote);

    if (!quote || !Array.isArray(quote) || quote.length === 0) {
        throw new Error("Failed to get quote from Defuse. Response: " + JSON.stringify(quote));
    }


    var best_quote_index = 0;
    var max:bigint = 0n;
    for (let index = 0; index < quote.length; index++) {
        const element = quote[index];
        if (BigInt(element.amount_out) > max)
        {
            max = BigInt(element.amount_out);
            best_quote_index = index;
        }
    }

    const in_token_decimal:number = defuseTokenIn.decimals;
    const out_token_decimal:number = defuseTokenOut.decimals;

    const in_usd_price:number = await getTokenPriceUSD(defuseTokenIn.cgId) * Number(quote[best_quote_index].amount_in) / Number(`1${"0".repeat(in_token_decimal)}`);
    const out_usd_price:number = await getTokenPriceUSD(defuseTokenOut.cgId) * Number(quote[best_quote_index].amount_out) / Number(`1${"0".repeat(out_token_decimal)}`);

    
    const loss:number = in_usd_price - out_usd_price;
    const loss_percent:number = ((Number(loss)) / Number(in_usd_price)) * 100;
    
    // console.log("IN USD PRICE: ", in_usd_price);
    // console.log("OUT USD PRICE: ", out_usd_price);
    // console.log("LOSS: ", loss);
    // console.log("LOSS_PERCENT: ", loss_percent);
    // console.log("BEST QOUTE INDEX: ", best_quote_index);


    if ((loss > SWAP_SAFETY_THRESHOLD_USD && loss_percent > SWAP_SAFETY_THRESHOLD_PERCENT_ABOVE_1USD) || (loss_percent > SWAP_SAFETY_THRESHOLD_PERCENT_BELOW_1USD))
    {
        throw new Error("Failed to get good quotes from Defuse. We rejected the quotes obtained . Response: " + JSON.stringify(quote));
    }
    
    const intentMessage: IntentMessage = {
        signer_id: settings.accountId,
        deadline: new Date(Date.now() + 300000).toISOString(),
        intents: [createTokenDiffIntent(
            quote[best_quote_index].defuse_asset_identifier_in,
            quote[best_quote_index].defuse_asset_identifier_out,
            quote[best_quote_index].amount_in,
            quote[best_quote_index].amount_out
        )]
    };

    const messageString = JSON.stringify(intentMessage);
    const nonce = new Uint8Array(crypto.randomBytes(32));
    const recipient = "intents.near";
    const { signature, publicKey } = await signMessage(keyPair, {
        message: messageString,
        recipient,
        nonce
    });

    await ensurePublicKeyRegistered(`ed25519:${publicKey}`);

    const intent = await publishIntent({
        quote_hashes: [quote[best_quote_index].quote_hash],
        signed_data: {
            payload: {
                message: messageString,
                nonce: Buffer.from(nonce).toString('base64'),
                recipient
            },
            standard: "nep413",
            signature: `ed25519:${signature}`,
            public_key: `ed25519:${publicKey}`
        }
    });

    if (intent.status === "OK") {
        const finalStatus = await pollIntentStatus(intent.intent_hash);
        return finalStatus;
    }

    return intent;
}
// const crossChainSwapTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

// Example response:
// \`\`\`json
// {
//             "defuse_asset_identifier_in": "NEAR",
//             "defuse_asset_identifier_out": "USDC,
//             "exact_amount_in": "1000",
//             "quote_id": "00000000-0000-0000-0000-000000000000", // OPTIONAL. default will be generated randomly
//             "min_deadline_ms": "60000" // OPTIONAL. default 120_000ms / 2min
//             "network": "near"
//         }
// \`\`\`

// {{recentMessages}}

// Given the recent messages and wallet information below:

// {{walletInfo}}

// Extract the following information about the requested token swap:
// - defuse_asset_identifier_in: The input token ID
// - defuse_asset_identifier_out: The output token ID
// - exact_amount_in: The amount to swap

// Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined. The result should be a valid JSON object with the following schema:
// \`\`\`json
// {
//     "defuse_asset_identifier_in": string | null,
//     "defuse_asset_identifier_out": string | null,
//     "exact_amount_in": string | null,
//     "network": string | null
// }
// \`\`\``;


// export const executeCrossChainSwap: Action = {
//     name: "NEAR_CROSS_CHAIN_SWAP",
//     description: "Swap tokens between NEAR and other supported chains",
//     similes: [
//         "swap NEAR tokens for tokens on other chains",
//         "perform cross-chain token exchange from NEAR",
//         "exchange NEAR tokens across different blockchains"
//     ],
//     examples: [
//         [
//             {
//                 user: "user1",
//                 content: {
//                     text: "Swap 10 NEAR for ETH"
//                 }
//             }
//         ],
//         [
//             {
//                 user: "user2",
//                 content: {
//                     text: "Exchange 5 NEAR to USDC on Base"
//                 }
//             }
//         ],
//         [
//             {
//                 user: "user3",
//                 content: {
//                     text: "Swap 100 USDC for NEAR"
//                 }
//             }
//         ]
//     ] as ActionExample[][],
//     validate: async (runtime: IAgentRuntime, message: Memory) => {
//         console.log("Message:", message);
//         return true;
//     },
//     handler: async (
//         runtime: IAgentRuntime,
//         message: Memory,
//         state: State,
//         _options: { [key: string]: unknown },
//         callback?: HandlerCallback
//     ): Promise<any> => {
//         if (!state) {
//             state = await runtime.composeState(message);
//         }

//         const swapContext = composeContext({
//             state,
//             template: crossChainSwapTemplate,
//         });

//         const response = await generateObjectDeprecated({
//             runtime,
//             context: swapContext,
//             modelClass: ModelClass.LARGE
//         });

//         console.log("Response:", response);
//         const responseObject = response as CrossChainSwapParams;
//         if (!responseObject.defuse_asset_identifier_in || !responseObject.defuse_asset_identifier_out
//              || !responseObject.exact_amount_in) {
//             console.log("Missing required parameters, skipping swap");

//             const responseMsg = {
//                 text: "I need to have the input token, output token, and amount to perform the swap",
//             };
//             callback?.(responseMsg);
//             return true;
//         }
//         if (!isTokenSupported(responseObject.defuse_asset_identifier_in) ||
//             !isTokenSupported(responseObject.defuse_asset_identifier_out)) {
//             console.log("Invalid asset identifiers provided");

//             const responseMsg = {
//                 text: `Invalid tokens provided. Supported tokens are: ${getAllSupportedTokens().join(', ')}`,
//             };
//             callback?.(responseMsg);
//             return true;
//         }

//         try {
//             const intent = await crossChainSwap(runtime, message, state, responseObject);
//             const txHashes = intent.data?.hash;
//             const responseMsg = {
//                 text: `Swap completed successfully! Transaction hashes: ${txHashes}`,
//             };

//             callback?.(responseMsg);
//             return true;
//         } catch (error) {
//             const responseMsg = {
//                 text: `Error during cross-chain swap: ${error instanceof Error ? error.message : String(error)}`,
//             };
//             callback?.(responseMsg);
//         }
//     }
// } as Action;



// const crossChainSwapAndWithdrawTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

// Example response:
// \`\`\`json
// {
//             "defuse_asset_identifier_in": "NEAR",
//             "defuse_asset_identifier_out": "USDC,
//             "exact_amount_in": "1000",
//             "quote_id": "00000000-0000-0000-0000-000000000000", // OPTIONAL. default will be generated randomly
//             "min_deadline_ms": "60000", // OPTIONAL. default 120_000ms / 2min
//             "destination_address": "0x1234567890abcdef",
//             "network": "base"
//         }
// \`\`\`

// {{recentMessages}}

// Given the recent messages and wallet information below:

// {{walletInfo}}

// Extract the following information about the requested token swap:
// - defuse_asset_identifier_in: The input token ID
// - defuse_asset_identifier_out: The output token ID
// - exact_amount_in: The amount to swap
// - destination_address: The address to withdraw to

// Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined. The result should be a valid JSON object with the following schema:
// \`\`\`json
// {
//     "defuse_asset_identifier_in": string | null,
//     "defuse_asset_identifier_out": string | null,
//     "exact_amount_in": string | null,
//     "destination_address": string | null,
//     "network": string | null
// }
// \`\`\``;



// export const executeCrossChainSwapAndWithdraw: Action = {
//     name: "WITHDRAW_NEAR_CROSS_CHAIN_SWAP",
//     description: "Swap tokens between NEAR and other supported chains, then withdraw to a different address on a specific network",
//     similes: [
//         "swap NEAR tokens for tokens on other chains, then withdraw to an address",
//         "perform cross-chain token exchange from NEAR, then withdraw to an address",
//         "exchange NEAR tokens across different blockchains, then withdraw to an address on a specific network"
//     ],
//     examples: [
//         [
//             {
//                 user: "user1",
//                 content: {
//                     text: "Swap 10 NEAR for ETH, then withdraw to an address on Ethereum"
//                 }
//             }
//         ],
//         [
//             {
//                 user: "user2",
//                 content: {
//                     text: "Exchange 5 NEAR to USDC on Base, then withdraw to an address on Base"
//                 }
//             }
//         ],
//         [
//             {
//                 user: "user3",
//                 content: {
//                     text: "Swap 100 USDC for NEAR, then withdraw to an address on Base"
//                 }
//             }
//         ]
//     ] as ActionExample[][],
//     validate: async (runtime: IAgentRuntime, message: Memory) => {
//         console.log("Message:", message);
//         return true;
//     },
//     handler: async (
//         runtime: IAgentRuntime,
//         message: Memory,
//         state: State,
//         _options: { [key: string]: unknown },
//         callback?: HandlerCallback
//     ): Promise<any> => {
//         if (!state) {
//             state = await runtime.composeState(message);
//         }

//         const swapContextAndWithdraw = composeContext({
//             state,
//             template: crossChainSwapAndWithdrawTemplate,
//         });

//         const response = await generateObjectDeprecated({
//             runtime,
//             context: swapContextAndWithdraw,
//             modelClass: ModelClass.LARGE
//         });

//         console.log("Response CrossChainSwapAndWithdrawParams:", response);
//         const responseObject = response as CrossChainSwapAndWithdrawParams;

//         if (!responseObject.defuse_asset_identifier_in || !responseObject.defuse_asset_identifier_out
//              || !responseObject.exact_amount_in || !responseObject.destination_address) {
//             console.log("Missing required parameters, skipping swap and withdraw");

//             const responseMsg = {
//                 text: "I need to have the input token, output token, amount, and destination address to perform the swap and withdraw",
//             };
//             callback?.(responseMsg);
//             return true;
//         }

//         if (!isTokenSupported(responseObject.defuse_asset_identifier_in) ||
//             !isTokenSupported(responseObject.defuse_asset_identifier_out)) {
//             console.log("Invalid asset identifiers provided");

//             const responseMsg = {
//                 text: `Invalid tokens provided. Supported tokens are: ${getAllSupportedTokens().join(', ')}`,
//             };
//             callback?.(responseMsg);
//             return true;
//         }

//         try {
//             const intent = await crossChainSwap(runtime, message, state, responseObject);
//             const withdrawIntent = await withdrawFromDefuse(runtime, message, state, responseObject);
//             const txHashes = [intent.data?.hash, withdrawIntent.data?.hash].join(", ");
//             const responseMsg = {
//                 text: `Swap completed successfully! Transaction hashes: ${txHashes}`,
//             };

//             callback?.(responseMsg);
//             return true;
//         } catch (error) {
//             console.error("Error during cross-chain swap and withdraw:", error);
//             const responseMsg = {
//                 text: `Error during cross-chain swap and withdraw: ${error instanceof Error ? error.message : String(error)}`,
//             };
//             callback?.(responseMsg);
//         }
//     }
// } as Action;


// interface RuntimeSettings {
//     networkId: string;
//     nodeUrl: string;
//     accountId: string;
//     secretKey: string;
//     defuseContractId: string;
// }

// function getRuntimeSettings(runtime: IAgentRuntime): RuntimeSettings {
//     const accountId = runtime.getSetting("NEAR_ADDRESS");
//     if (!accountId) {
    //         throw new Error("NEAR_ADDRESS not configured");
    //     }
    
    //     const secretKey = runtime.getSetting("NEAR_WALLET_SECRET_KEY");
    //     if (!secretKey) {
//         throw new Error("NEAR_WALLET_SECRET_KEY not configured");
//     }

//     return {
//         networkId: runtime.getSetting("NEAR_NETWORK") || "testnet",
//         nodeUrl: runtime.getSetting("NEAR_RPC_URL") || "https://rpc.testnet.near.org",
//         accountId: runtime.getSetting("NEAR_ADDRESS") || "",
//         secretKey: runtime.getSetting("NEAR_WALLET_SECRET_KEY") || "",
//         defuseContractId: runtime.getSetting("DEFUSE_CONTRACT_ID") || "intents.near"
//     };
// }

// /// Returns set of public keys registered for given account
// fn public_keys_of(&self, account_id: &AccountId) -> HashSet<PublicKey>;

async function addPublicKeyToIntents(publicKey: string): Promise<void> {

    const keyStore = new keyStores.InMemoryKeyStore();
    const keyPair = utils.KeyPair.fromString(settings.secretKey as KeyPairString);
    await keyStore.setKey(settings.networkId, settings.accountId, keyPair);

    const nearConnection = await connect({
        networkId: settings.networkId,
        keyStore,
        nodeUrl: settings.nodeUrl,
    });

    const account = await nearConnection.account(settings.accountId);

    console.log("Adding public key to intents contract:", publicKey);
    await account.functionCall({
        contractId: "intents.near",
        methodName: "add_public_key",
        args: {
            public_key: publicKey
        },
        gas: BigInt(FT_DEPOSIT_GAS),
        attachedDeposit: BigInt(1)
    });
}

async function getPublicKeysOf(accountId: string): Promise<Set<string>> {
    const nearConnection = await connect({
        networkId: settings.networkId,
        nodeUrl: settings.nodeUrl,
    });

    const account = await nearConnection.account(accountId);
    const result = await account.viewFunction({
        contractId: settings.defuseContractId || "intents.near",
        methodName: "public_keys_of",
        args: { account_id: accountId }
    });

    return new Set(result);
}

async function ensurePublicKeyRegistered(publicKey: string): Promise<void> {
    const existingKeys = await getPublicKeysOf(settings.accountId);
    if (!existingKeys.has(publicKey)) {
        console.log(`Public key ${publicKey} not found, registering...`);
        await addPublicKeyToIntents(publicKey);
    } else {
        console.log(`Public key ${publicKey} already registered`);
    }
}


export async function withdrawFromDefuse(params: CrossChainSwapAndWithdrawParams): Promise<any> {
    try {
        const keyStore = new keyStores.InMemoryKeyStore();
        const keyPair = utils.KeyPair.fromString(settings.secretKey as KeyPairString);
        await keyStore.setKey(settings.networkId, settings.accountId, keyPair);

        const network = params.network || "near";

        // Generate nonce using crypto
        const nonce = new Uint8Array(crypto.randomBytes(32));

        // Get token details and defuse asset ID
        const token = getTokenBySymbol(params.defuse_asset_identifier_out);
        console.log("Token:", token);
        if (!token) {
            throw new Error(`Token ${params.defuse_asset_identifier_out} not found`);
        }

        const nearConnection = await connect({
            networkId: settings.networkId,
            keyStore,
            nodeUrl: settings.nodeUrl,
        });

        // Check balances
        const tokenBalances = await getBalances([token], nearConnection.connection.provider, network);
        console.log("Token balances:", tokenBalances);

        const defuseAssetIdentifierOut = getDefuseAssetId(token, network);
        const defuseAssetOutAddrs = defuseAssetIdentifierOut.replace('nep141:', '');

        const tokenBalance = tokenBalances[defuseAssetIdentifierOut];
        if (tokenBalance === undefined) {
            throw new Error(`No balance found for token ${defuseAssetIdentifierOut}`);
        }

        const amountInBigInt = convertAmountToDecimals(params.exact_amount_in, token);


        const nep141balance = await getNearNep141StorageBalance({
            contractId: defuseAssetOutAddrs,
            accountId: settings.accountId
        });

        const storage_deposit: bigint = (nep141balance > BigInt(FT_MINIMUM_STORAGE_BALANCE_LARGE)) ? 0n : BigInt(FT_MINIMUM_STORAGE_BALANCE_LARGE);

        // Create intent message
        const intentMessage: IntentMessage = {
            signer_id: settings.accountId,
            deadline: new Date(Date.now() + 300000).toISOString(), // 5 minutes from now
            intents: [{
                intent: "ft_withdraw",
                token: defuseAssetOutAddrs,
                receiver_id: params.destination_address,
                amount: amountInBigInt.toString(),
                memo: "",
                deposit: (storage_deposit).toString()
            }]

            // intents: [{
            //     intent: "native_withdraw",
            //     receiver_id: params.destination_address,
            //     amount: params.exact_amount_in,
            // }]
        };

        console.log("Intent message:", intentMessage);

        const messageString = JSON.stringify(intentMessage);
        const recipient = "intents.near";
        // const recipient = settings.accountId;

        // Sign the message
        const { signature, publicKey } = await signMessage(keyPair, {
            message: messageString,
            recipient,
            nonce
        });

        // Ensure public key is registered
        await ensurePublicKeyRegistered(`ed25519:${publicKey}`);

        // Publish intent
        const intent = await publishIntent({
            quote_hashes: [], // Empty for withdrawals
            signed_data: {
                payload: {
                    message: messageString,
                    nonce: Buffer.from(nonce).toString('base64'),
                    recipient
                },
                standard: "nep413",
                signature: `ed25519:${signature}`,
                public_key: `ed25519:${publicKey}`
            }
        });

        if (intent.status === "OK") {
            const finalStatus = await pollIntentStatus(intent.intent_hash);
            return finalStatus;
        }

        return intent;
    } catch (error) {
        console.error("Error in withdrawFromDefuse:", error);
        throw error;
    }
}
