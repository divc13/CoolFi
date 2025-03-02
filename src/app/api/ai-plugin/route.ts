import { ACCOUNT_ID, PLUGIN_URL } from "@/app/config";
import { NextResponse } from "next/server";
import tokenData from "@/app/near-intent/config/tokens.json";

export async function GET() {

    const coinsArray = [
        // From unified_tokens
        { symbol: "USDC", name: "USD Coin", decimals: 6 },
        { symbol: "ETH", name: "ETH", decimals: 18 },
        { symbol: "AURORA", name: "Aurora", decimals: 18 },
        { symbol: "TURBO", name: "Turbo", decimals: 18 },
        
        // From single_chain_tokens
        { symbol: "NEAR", name: "Near", decimals: 24 },
        { symbol: "BTC", name: "Bitcoin", decimals: 8 },
        { symbol: "SOL", name: "Solana", decimals: 9 },
        { symbol: "DOGE", name: "Dogecoin", decimals: 8 },
        { symbol: "XRP", name: "XRP", decimals: 6 },
        { symbol: "PEPE", name: "Pepe", decimals: 18 },
        { symbol: "SHIB", name: "Shiba Inu", decimals: 18 },
        { symbol: "LINK", name: "Chainlink", decimals: 18 },
        { symbol: "UNI", name: "Uniswap", decimals: 18 },
        { symbol: "ARB", name: "Arbitrum", decimals: 18 },
        { symbol: "AAVE", name: "Aave", decimals: 18 },
        { symbol: "GMX", name: "GMX", decimals: 18 },
        { symbol: "MOG", name: "Mog Coin", decimals: 18 },
        { symbol: "BRETT", name: "Brett", decimals: 18 },
        { symbol: "SWEAT", name: "Sweat Economy", decimals: 18 },
        { symbol: "WIF", name: "dogwifhat", decimals: 6 },
        { symbol: "BOME", name: "BOOK OF MEME", decimals: 6 }
      ];

    const pluginData = {
        openapi: "3.1.0",
        info: {
            title: "CoolFi AI",
            description: "AI for the CoolFi",
            version: "1.0.0",
        },
        servers: [
            {
                url: PLUGIN_URL,
            },
        ],
        "x-mb": {
            "account-id": ACCOUNT_ID,
            assistant: {
                name: "CoolFi AI",
                description: "A blockchain assistant that provides information, retrieves the user's account ID, interacts with Twitter, creates NEAR transaction payloads, and helps with crypto swaps with tree different apis: deposit, swap and withdraw. ",
                instructions: `You assist with NEAR transactions, blockchain queries, account retrieval, Twitter interactions, and crypto swaps.You are provided with the twitter API's and so you can interact with the user on twitter.

                You only support the cryptocurrencies mentioned in ${JSON.stringify(coinsArray)}. If a user asks for an operation on a cryptocurrency which is not mentioned in ${JSON.stringify(coinsArray)}, please deny all such operations. THIS IS IMPORTANT

                For Retrieval of Account Details:
                1. Use /api/tools/get-account-details to get the whole account details of the user.
                2. Whole balance is composed of 2 parts, one is the balance of different tokens in the wallet, and another is the balance of the tokens of the user in defuse of near-intents. 
                
                For blockchain transactions:
                1. Generate a transaction payload using "/api/tools/create-near-transaction".
                2. Use the 'generate-transaction' tool to execute the transaction.
                
                For Depositing Crypto into defuse or Near Intents:
                1. For all cryptocurrencies in ${JSON.stringify(coinsArray)} other than bitcoin, Generate a transaction payload using "/api/tools/defuse-deposit".
                2. If the crytocurrency to deposit in defuse or near intents is bitcoin or satoshi, then use "/api/tools/btc-defuse-deposit" to genrate transaction payload which is then relayed through "/api/tools/relay-transaction"
                
                For Swapping Crypto in Defuse or Near Intents:
                1. Retrieve the swap intent message using "/api/tools/defuse-swap".
                2. Sign the intent using the 'sign-message' tool.
                3. Publish the signed intent using "/api/tools/publish-intent", Take the public key from the return values of sign-message.
                Both retrieval and publishing steps are required to complete a swap.
                
                For Withdrawing Crypto from Defuse or Near Intents:
                1. Retrieve the swap intent message using "/api/tools/defuse-withdraw".
                2. Sign the intent using the 'sign-message' tool.
                3. Publish the signed intent using "/api/tools/publish-intent, Take the public key from the return values of sign-message".
                Both retrieval and publishing steps are required to complete a withdrawal.

                For Bitcoin Transfers:
                1. Retrieve the transfer intent message using "/api/tools/transfer-bitcoin".
                2. Create a link to https://wallet.bitte.ai/sign-transaction/ after putting in the data in the url. Make sure to add the call back url to the link along with payload and the data.

                Important Rules:
                
                1. sign-message takes in transaction payload which can optionally contain url. Dont miss out on the url.
                2. Whenever you take in the amount related to any currency for any purpose, ensure that it is in the same denomination as mentioned in ${JSON.stringify(coinsArray)}. For example, If the cryptocurrency is BTC, then the amount should be in BTC, not satoshi.
                3. If a user asks any operation to be done on a cryptocurrency which is not mentioned in ${JSON.stringify(coinsArray)}, please deny all such operations. We only support the cryptocurrencies mentioned in ${JSON.stringify(coinsArray)}.

                Complete Swap Process (Deposit + Swap + Withdraw)
                When performing a complete cryptocurrency swap (not using Twitter):
                Call all three APIs sequentially:
                First: Deposit funds
                Second: Swap 
                Third: Withdraw

                If the query is from twitter to make a swap process,
                a link is generated using the /api/twitter/swap api, which must be sent to the user along with required description using the send-message tool. This one link is sufficient for all the three steps of the complete swap.

                Wait for user to sign the message before proceeding to the next step.
                Only skip steps if explicitly instructed by the user but no need to ask again and again if the user wants to proceed.

                `,
                tools: [{ type: "generate-transaction" }, { type: "sign-message" }, { type: "get-token-metadata" }],
                image: `${PLUGIN_URL}/coolfi.svg`,
                categories: ["defi"],
            },
            image: `${PLUGIN_URL}/coolfi.svg`,
        },
        paths: {
            "/api/twitter/swap": {
                get: {
                    operationId: "SwapCryptoUsingTwitter",
                    summary: "Provides the twitter user a single link for the complete swap process. ",
                    description: `This will generate a single link, which is capable enough of the complete swap process, starting at depositing into defuse, then swapping inside defuse or intents, and finally withdrawing the amount to user wallet. Note that the complete swap process is different from the swap inside defuse. This is a 3 staged design, but will be completed with a single link. The link generated should be sent to the user via twitter send-message api along with required description. This tool should only be called if the message is from twitter. `,
                    parameters: [
                        {
                            name: "accountId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: `Near account ID of the user`
                        },
                        {
                            name: "receiverId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The NEAR account ID of the receiver of funds. This can be the user himself or if specified then someone else."
                        },
                        {
                            name: "tokenIn",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: `The token user wants to deposit. If possible understand and fill on your own. Do ask if obsecure. This must be one of the tokens from ${tokenData}. This is only the name of the token.`
                        },
                        {   
                            name: "tokenOut",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The type of cryptocurrency the user is swapping from."
                        },
                        {
                            name: "amount",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "the amount to deposit into defuse or near intents."
                        },
                        {
                            name: "conversationId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The conversation id of the twitter chat"
                        },
                    ],
                    responses: {
                        "200": {
                            description: "Returns the link for the swap",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            link: {
                                                type: "string",
                                                description: "The link to send to the user on twitter. Send this to the user using send-message api along with required description"
                                            },
                                        },
                                    }
                                }
                            }
                        },
                        "400": {
                            description: "Bad request",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "500": {
                            description: "Error response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "/api/tools/swap": {
                get: {
                    operationId: "SwapCrypto",
                    summary: "You need to call the apis of Deposit, Swap and withdraw to complete the swap. Do wait for user to sign each transaction.",
                    description: `This api is just a place holder, Calling it will just get page not found. First call deposit into defuse. Wait for user to sign. Then swap in defuse. Again wait for user, Then withdraw and again wait. This tool should not be called if the message is from twitter. Note that the complete swap process is different from the swap inside defuse.`,
                    parameters: [
                        {
                            name: "accountId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: `Near account ID of the user`
                        },
                        {
                            name: "receiverId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The NEAR account ID of the receiver of funds. This can be the user himself or if specified then someone else."
                        },
                        {
                            name: "tokenIn",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: `The token user wants to deposit. If possible understand and fill on your own. Do ask if obsecure. This must be one of the tokens from ${tokenData}. This is only the name of the token.`
                        },
                        {
                            name: "amount",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "the amount to deposit into defuse or near intents."
                        },
                    ],
                }
            },
            "/api/tools/send-message": {
                get: {
                    operationId: "sendMessageOnTwitter",
                    summary: "function call for sending message to user on twitter.",
                    description: `Sends message to user on twitter. Takes the conversation id and the message as the input, and sends the message to twitter on the corresponding conversation Id.`,
                    parameters: [
                        {
                            name: "conversationId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The conversation id of the twitter chat"
                        },
                        {
                            name: "message",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: `The message to be sent to the user on twitter`
                        },
                    ],
                    responses: {
                        "200": {
                            description: "Successful response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {},
                                    },
                                },
                            },
                        },
                        "400": {
                            description: "Bad request",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "500": {
                            description: "Server error",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                },
            },
            "/api/twitter/defuse-deposit": {
                get: {
                    operationId: "depositIntoDefuseUsingTwitter",
                    summary: "Sends the transaction link to the user for deposit into defuse or near intents",
                    description: `This method should only be called if the query is from twitter. If the query is from twitter, it shall contain the conversation id and explicitly say that this is a message from twitter.  
                    Send the transaction Link along with required description to the user on twitter using send-message api. If you dont have the user account id, ask for it on twitter using send-message.`,
                    parameters: [
                        {
                            name: "conversationId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The conversation id of the twitter chat"
                        },
                        {
                            name: "accountId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The NEAR account ID of the user"
                        },
                        {
                            name: "tokenIn",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: `The token user wants to deposit. If possible understand and fill on your own. Do ask if obsecure. This is only the name of the token.`
                        },
                        {
                            name: "amount",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "the amount to deposit into defuse or near intents."
                        },
                    ],
                    responses: {
                        "200": {
                            description: "Successful response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            link: {
                                                type: "string",
                                                description: "The link to send to the user on twitter. Send this to the user using send-message api along with required description"
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        "400": {
                            description: "Bad request",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "500": {
                            description: "Server error",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                },
            },
            "/api/tools/defuse-deposit": {
                get: {
                    operationId: "depositIntoDefuse",
                    summary: "function call for depositing crypto into defuse or near intents.",
                    description: `Generates transaction to allow users to deposit their currency into defuse or near intents. Take the crypto currency to be deposited from the user. Also ask for the amount to be deposited. Whenever you take in the amount related to any currency, ensure that it is in the same denomination as mentioned in ${coinsArray}. For example, If the cryptocurrency is BTC, then the amount should be in BTC, not satoshi. If a user asks for done on a cryptocurrency which is not mentioned in coinsArray given in the instructions, please deny all such operations.
                    This method should not be called if the message is from twitter.
                    `,
                    parameters: [
                        {
                            name: "accountId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The NEAR account ID of the user"
                        },
                        {
                            name: "tokenIn",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: `The token user wants to deposit. If possible understand and fill on your own. Do ask if obsecure. This is only the name of the token.`
                        },
                        {
                            name: "amount",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "the amount to deposit into defuse or near intents."
                        },
                    ],
                    responses: {
                        "200": {
                            description: "Successful response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            receiverId: {
                                                type: "string",
                                                description: "The receiver's NEAR account ID"
                                            },
                                            actions: {
                                                type: "array",
                                                items: {
                                                    type: "object",
                                                    properties: {
                                                        type: {
                                                            type: "string",
                                                            description: "The type of action (e.g., 'Transfer')"
                                                        },
                                                        params: {
                                                            type: "object",
                                                            additionalProperties: true,
                                                        }
                                                    }
                                                }
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        "400": {
                            description: "Bad request",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "500": {
                            description: "Server error",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                },
            },
            "/api/twitter/defuse-swap": {
                get: {
                    operationId: "swapCryptoInDefuseUsingTwitter",
                    summary: "Sends the sign-message link to the user for swapping crypto in defuse or near intents",
                    description: `This method should only be called if the query is from twitter. If the query is from twitter, it shall contain the conversation id and explicitly say that this is a message from twitter.  
                    This method should be called only if the swap is told to be made inside defuse explcitly. Otherwise, the swap-crypto-twitter method should be used.
                    Send the sign-message Link along with required description to the user on twitter using send-message api. If you dont have the user account id, ask for it on twitter using send-message. Donot call publish-intent yourself.`,
                    parameters: [
                        {
                            name: "conversationId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The conversation id of the twitter chat"
                        },
                        {
                            name: "accountId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The NEAR account ID of the user"
                        },
                        {
                            name: "amountIn",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The amount of input crypto which user wants to swap"
                        },
                        {   
                            name: "tokenIn",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The type of cryptocurrency the user is swapping from."
                        },
                        {   
                            name: "tokenOut",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The type of cryptocurrency the user is swapping to."
                        },
                        {
                            name: "callback_url",
                            in: "query",
                            required: false,
                            schema: {
                                type: "string"
                            },
                            description: "The callback url that should be passed on to the publish intent method. This is an optional parameter."
                        },
                    ],
                    responses: {
                        "200": {
                            description: "Returns the swap intent message.",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            link: {
                                                type: "string",
                                                description: "The link to send to the user on twitter. Send this to the user using send-message api along with required description"
                                            },
                                            return: {
                                                type: "string",
                                                description: "Extra information for the swap"
                                            },
                                        },
                                    }
                                }
                            }
                        },
                        "400": {
                            description: "Bad request",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "500": {
                            description: "Error response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
            },
            "/api/tools/defuse-swap": {
                get: {
                    operationId: "swapCryptoInDefuse",
                    summary: "Retrieve a message to swap cryptocurrency.",
                    description: `Generates an intent message for swapping crypto based on user input. This message must be signed and then published (using publish-intent) to complete the swap. Show the signature and publicKey obtained after this method call to the user. Whenever you take in the amount related to any currency, ensure that it is in the same denomination as mentioned in coinsArray given in instructions. For example, If the cryptocurrency is BTC, then the amount should be in BTC, not satoshi. This method should not be called if the message is from twitter.`,
                    parameters: [
                        {
                            name: "accountId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The NEAR account ID of the user"
                        },
                        {
                            name: "amountIn",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The amount of input crypto which user wants to swap"
                        },
                        {   
                            name: "tokenIn",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The type of cryptocurrency the user is swapping from."
                        },
                        {   
                            name: "tokenOut",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The type of cryptocurrency the user is swapping to."
                        },
                    ],
                    responses: {
                        "200": {
                            description: "Returns the swap intent message.",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            transactionPayload: {
                                                type: "object",
                                                description: "The payload to sign and publish. To take in everything in here, even the callbackUrl",
                                                properties: {
                                                    message: {
                                                        type: "string",
                                                        description: "The message to sign before publishing."
                                                    },
                                                    receiverId: {
                                                        type: "string",
                                                        description: "The contract's near id"
                                                    },
                                                    nonce: {
                                                        type: "string",
                                                        description: "The unique identifier for the transaction. This is a base64 string. ",
                                                        example1 : "HXRpqKa9xCGMpB37KpfQjSinMVQKuN1WF2Au72Pqg9Y=",
                                                        example2: "zanFCPTWKvvV5oBhL1JnZj4p7cUkqt1+PPff4j6GwLA="
                                                    },
                                                    callbackUrl: {
                                                        type: "string",
                                                        description: "url to call back on success"
                                                    },
                                                }
                                            },
                                            netReturns: {
                                                type: "object",
                                                additionalProperties: true,
                                                description: "The net returns of the swap. Show this to user before they sign the message."
                                            },
                                            quote_hash: {
                                                type: "string",
                                                description: "quote hash of the best quote index."
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "400": {
                            description: "Bad request",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "500": {
                            description: "Error response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
            },
            "/api/twitter/defuse-withdraw": {
                get: {
                    operationId: "defuseWithdrawUsingTwitter",
                    summary: "Sends the sign-message link to the user for withdrawing crypto in defuse or near intents",
                    description: `This method should only be called if the query is from twitter. If the query is from twitter, it shall contain the conversation id and explicitly say that this is a message from twitter.  
                    Send the sign-message Link along with required description to the user on twitter using send-message api. If you dont have the user account id, ask for it on twitter using send-message.`,
                    parameters: [
                        {
                            name: "conversationId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The conversation id of the twitter chat"
                        },
                        {
                            name: "accountId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The NEAR account ID of the user"
                        },
                        {
                            name: "receiverId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The NEAR account ID of the receiver of funds. This can be the user himself or if specified then someone else."
                        },
                        {
                            name: "exact_amount_in",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The amount of input crypto which user wants to swap"
                        },
                        {   
                            name: "defuse_asset_identifier_in",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The type of cryptocurrency the user is swapping from."
                        },
                    ],
                    responses: {
                        "200": {
                            description: "Returns the swap intent message.",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            link: {
                                                type: "string",
                                                description: "The link to send to the user on twitter. Send this to the user using send-message api along with required description"
                                            },
                                        },
                                    }
                                }
                            }
                        },
                        "400": {
                            description: "Bad request",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "500": {
                            description: "Error response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
            },
            "/api/tools/defuse-withdraw": {
                get: {
                    operationId: "defuseWithdraw",
                    summary: "Withdraws crypto from defuse or near intents.",
                    description: `Generates an intent message for withdrawing crypto from near intents or defuse based on user input. This message must be signed and then published (using publish-intent) to complete the swap. Whenever you take in the amount related to any currency, ensure that it is in the same denomination as mentioned in coinsArray given in instructions. For example, If the cryptocurrency is BTC, then the amount should be in BTC, not satoshi. This method should not be called if the message is from twitter.`,
                    parameters: [
                        {
                            name: "accountId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The NEAR account ID of the user."
                        },
                        {
                            name: "receiverId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The NEAR account ID of the receiver of funds. This can be the user himself or if specified then someone else."
                        },
                        {
                            name: "exact_amount_in",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The amount of input crypto which user wants to swap"
                        },
                        {   
                            name: "defuse_asset_identifier_in",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The type of cryptocurrency the user is swapping from."
                        },
                        // {
                        //     name: "callbackUrl",
                        //     in: "query",
                        //     // value: "/api/tools/publish-intent",
                        //     required: true,
                        //     schema: {
                        //         type: "string",
                        //         default: "/api/tools/publish-intent"
                        //     },
                        //     description: "The URL to send the signature and publicKey of signed intent along with the intent message itself and the receiverId and nonce"
                        // },
                    ],
                    responses: {
                        "200": {
                            description: "Returns the swap intent message.",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            message: {
                                                type: "string",
                                                description: "The message to sign before publishing."
                                            },
                                            receiverId: {
                                                type: "string",
                                                description: "The contract's near id"
                                            },
                                            nonce: {
                                                type: "string",
                                                description: "The unique identifier for the transaction. This is a base64 string. ",
                                                example1 : "HXRpqKa9xCGMpB37KpfQjSinMVQKuN1WF2Au72Pqg9Y=",
                                                example2: "zanFCPTWKvvV5oBhL1JnZj4p7cUkqt1+PPff4j6GwLA="
                                            },
                                        }
                                    }
                                }
                            }
                        },
                        "400": {
                            description: "Bad request",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "500": {
                            description: "Error response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
            },
            "/api/twitter/publish-intent": {
                get: {
                    operationId: "publishIntentUsingTwitter",
                    summary: "Publish a signed crypto swap intent.",
                    description: `This method should only be called if the query is from twitter. If the query is from twitter, it shall contain the conversation id and explicitly say that this is a message from twitter. If you dont have the user account id, ask for it on twitter using send-message.
                    Finalizes the crypto swap by submitting the signed intent message.`,
                    parameters: [
                        {
                            name: "accountId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The NEAR account ID of the user"
                        },
                        {
                            name: "signature",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The cryptographic signature generated for the intent message in the form of a hexadecimal string. This is available after signing from the return params of sign-message - no need to ask the user. Do not encode or decode any thing by your own."
                        },
                        {
                            name: "publicKey",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The ed25519 public key from the signing result. Example format: 'ed25519:HeaBJ...'. Do not encode or decode any thing by your own. Take this value from the result of sign-message. Do not default to some example given or user wallet. This is basically the public key for the user who signed the message."
                        },
                        {
                            name: "data",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The data for which the message was signed. This should be the exact message obtained from the swap API and used in the signing process."
                        },
                        {
                            name: "callback_url",
                            in: "query",
                            required: false,
                            schema: {
                                type: "string"
                            },
                            description: "The callback url which should be called after a successful publish intent. This is an optional parameter."
                        },
                    ],
                    responses: {
                        "200": {
                            description: "Intent successfully published.",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            accountDetails: {
                                                type: "string",
                                                description: "The user's account details",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        "400": {
                            description: "Bad request",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "500": {
                            description: "Server error",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                },
            },
            "/api/tools/publish-intent": {
                get: {
                    operationId: "publishIntent",
                    summary: "Publish a signed crypto swap intent.",
                    description: "Finalizes the crypto swap by submitting the signed intent message. The public key should be automatically extracted from the signing result - typically available in the response from the signing process as 'signResult.publicKey'. Get the quote hash from the best quote. This is required for swapping, not for withdrawals. This method should not be called if the message is from twitter.",
                    parameters: [
                        {
                            name: "accountId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The NEAR account ID of the user"
                        },
                        {
                            name: "signature",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The cryptographic signature generated for the intent message in the form of a hexadecimal string. This is available after signing from the return params of sign-message - no need to ask the user. Do not encode or decode any thing by your own."
                        },
                        {
                            name: "publicKey",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The ed25519 public key from the signing result. Example format: 'ed25519:HeaBJ...'. Do not encode or decode any thing by your own. Take this value from the result of sign-message. Do not default to some example given or user wallet. This is basically the public key for the user who signed the message."
                        },
                        {
                            name: "message",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The intent message that was signed. This should be the exact message obtained from the swap API and used in the signing process."
                        },
                        {
                            name: "receiverId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The  NEAR contract ID where the intent will be published (typically 'intents.near')"
                        },
                        {
                            name: "nonce",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string",
                            },
                            description: "The unique nonce value from the intent message. This must match the nonce used in the signing process. This is already a base64 encoded string. Do Not encode it again into base64."
                        },
                        {
                            name: "quote_hash",
                            in: "query",
                            required: false,
                            schema: {
                                type: "string"
                            },
                            description: "quote hash of the best qoute. Required for swapping, not for withdrawals."
                        }
                    ],
                    responses: {
                        "200": {
                            description: "Intent successfully published.",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            accountDetails: {
                                                type: "string",
                                                description: "The user's account details",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        "400": {
                            description: "Bad request",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "500": {
                            description: "Server error",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                },
            },
            "/api/twitter/get-account-details": {
                get: {
                    operationId: "getAcountDetailsUsingTwitter",
                    summary: "get user wallet details",
                    description: `This method should only be called if the query is from twitter. If the query is from twitter, it shall contain the conversation id and explicitly say that this is a message from twitter.  
                    Respond with user wallet details along with required description to the user on twitter using send-message api. If you dont have the user account id, ask for it on twitter using send-message. The account details consist of two parts, user wallet details and the balance of the tokens deposited in defuse or near intents. Show their information separately to the users.`,
                    parameters: [
                        {
                            name: "conversationId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The conversation id of the twitter chat"
                        },
                        {
                            name: "accountId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The NEAR account ID of the user"
                        },
                    ],
                    responses: {
                        "200": {
                            description: "Successful response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            token_balance_wallet: {
                                                type: "string",
                                                description: "The user's account details. This contains the details of the amount of different tokens present in user wallet.",
                                            },
                                            satoshi: {
                                                type: "string",
                                                description: "The user's number of satoshi details in the user wallet",
                                            },
                                            token_balance_defuse: {
                                                type: "string",
                                                description: "This is the amount of different tokens deposited into in defuse or near intents. This is different from the wallet balance.",
                                            }
                                        },
                                    },
                                },
                            },
                        },
                        "400": {
                            description: "Bad request",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "500": {
                            description: "Server error",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                },
            },
            "/api/tools/get-account-details": {
                get: {
                    operationId: "getAcountDetails",
                    summary: "get user wallet details",
                    description: "Respond with user wallet details. This method should not be called if the message is from twitter. The account details consist of two parts, user wallet details and the balance of the tokens deposited in defuse or near intents. Show their information separately to the users.",
                    parameters: [
                        {
                            name: "accountId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The NEAR account ID of the user"
                        },
                    ],
                    responses: {
                        "200": {
                            description: "Successful response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            ttoken_balance_wallet: {
                                                type: "string",
                                                description: "The user's account details. This contains the details of the amount of different tokens present in user wallet.",
                                            },
                                            satoshi: {
                                                type: "string",
                                                description: "The user's number of satoshi details in the user wallet",
                                            },
                                            token_balance_defuse: {
                                                type: "string",
                                                description: "This is the amount of different tokens deposited into in defuse or near intents. This is different from the wallet balance.",
                                            }
                                        },
                                    },
                                },
                            },
                        },
                        "400": {
                            description: "Bad request",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "500": {
                            description: "Server error",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                },
            },
            "/api/twitter/transfer-bitcoin": {
                get: {
                    operationId: "transferBitcoinUsingTwitter",
                    summary: "Sends the sign-transaction link to the user for transfering bitcoin.",
                    description: `This method should only be called if the query is from twitter. If the query is from twitter, it shall contain the conversation id and explicitly say that this is a message from twitter.  
                    Send the sign-transaction Link along with required description to the user on twitter using send-message api. If you dont have the user account id, ask for it on twitter using send-message. 
                    Generates transaction to transfer bitcoin to another account. If the user gives the amount in satoshi, convert it to BTC and then proceed.`,
                    parameters: [
                        {
                            name: "conversationId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The conversation id of the twitter chat"
                        },
                        {
                            name: "accountId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The NEAR account ID of the user"
                        },
                        {
                            name: "receiverId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "This receiverId can be bitcoin address or it can be NEAR account ID of the recepient."
                        },
                        {
                            name: "isReceiverIdNearAccount",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "'true' if receiverId is NEAR account ID, 'false' if receiverId is bitcoin address. If possible understand and fill on your own. (eg for near account is user.near)"
                        },
                        {
                            name: "amount",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "amount to transfer. This can be either in bitcoin or satoshi. If possible understand and fill on your own."
                        },
                        {
                            name: "isAmountInBitcoin",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "'true' if amount is in bitcoin, 'false' if amount is in NEAR/satoshi. This is very important. But try to fill it on your own."
                        },
                    ],
                    responses: {
                        "200": {
                            description: "Successful response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            link: {
                                                type: "string",
                                                description: "The link to send to the user on twitter"
                                            },
                                        },
                                    }
                                }
                            },
                        },
                        "400": {
                            description: "Bad request",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "500": {
                            description: "Server error",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                },
            },
            "/api/tools/transfer-bitcoin": {
                get: {
                    operationId: "transferBitcoin",
                    summary: "transfer bitcoin",
                    description: "Generates transaction to transfer bitcoin to another account, the amount should be in satoshi. After getting the response: 1) Make a link to https://wallet.bitte.ai/sign-transaction endpoint (I want you to make me sign the transaction using this endpoint instead of generate-transaction). Do fill in :transactionData with the data coming in response. Take the amount in BTC, and not in satoshi from the users. If the user gives the amount in satoshi, convert it to BTC and then proceed. This method should not be called if the message is from twitter.",
                    parameters: [
                        {
                            name: "accountId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The NEAR account ID of the user"
                        },
                        {
                            name: "receiverId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "This receiverId can be bitcoin address or it can be NEAR account ID of the recepient."
                        },
                        {
                            name: "isReceiverIdNearAccount",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "'true' if receiverId is NEAR account ID, 'false' if receiverId is bitcoin address. If possible understand and fill on your own. (eg for near account is user.near)"
                        },
                        {
                            name: "amount",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "amount to transfer. This can be either in bitcoin or satoshi. If possible understand and fill on your own."
                        },
                        {
                            name: "isAmountInBitcoin",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "'true' if amount is in bitcoin, 'false' if amount is in NEAR/satoshi. This is very important. But try to fill it on your own."
                        },
                        {
                            name: "callbackUrl",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: `call https://wallet.bitte.ai/sign-transaction?transactions_data=:transactionPayload&callback_url=http://${PLUGIN_URL}/api/tools/relay-transaction?data=:transactionData . Do fill in transactionData and transactionPayload with all the required params.`
                        },
                    ],
                    responses: {
                        "200": {
                            description: "Successful response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            transactionPayload: {
                                                type: "string",
                                                // description: "payload needs to be signed  and relay it through relayTransaction. This is transactions_data.",
                                            },
                                            transactionData: {
                                                type: "string",
                                                // description: "This transactionData needs to be sent to relayTransaction (no need to sign this)",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        "400": {
                            description: "Bad request",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "500": {
                            description: "Server error",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                },
            },
            "/api/twitter/relay-transaction": {
                get: {
                    operationId: "relayTransactionUsingTwitter",
                    summary: "relay the transactions sent",
                    description: `This method should only be called if the query is from twitter. If the query is from twitter, it shall contain the conversation id and explicitly say that this is a message from twitter. If you dont have the user account id, ask for it on twitter using send-message.,
                    This will take the transaction payload and relay it to the bitcoin network. The data and the transaction hash are neccesary and should be given.`,
                    parameters: [
                        {
                            name: "accountId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "account id of the user who has signed the transaction."
                        },
                        {
                            name: "data",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "data should be taken from the api which got the payload."
                        },
                        {
                            name: "transactionHashes",
                            in: "query", 
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The transaction hash got from signing the transaction. This is something which you will get on sign-transaction endpoint."
                        }
                    ],
                    responses: {
                        "200": {
                            description: "Successful response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            transactionHash: {
                                                type: "string",
                                                description: "The transaction hash of the relayed transaction",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        "400": {
                            description: "Bad request",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "500": {
                            description: "Server error",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                },
            },
            "/api/tools/relay-transaction": {
                get: {
                    operationId: "relayTransaction",
                    summary: "relay the transactions sent",
                    description: "This will take the transaction payload and relay it to the bitcoin network. The data and the transaction hash are neccesary and should be given. This method should not be called if the message is from twitter.",
                    parameters: [
                        {
                            name: "accountId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "account id of the user who has signed the transaction."
                        },
                        {
                            name: "data",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "data should be taken from the api which got the payload."
                        },
                        {
                            name: "transactionHashes",
                            in: "query", 
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The transaction hash got from signing the transaction. This is something which you will get on sign-transaction endpoint."
                        }
                    ],
                    responses: {
                        "200": {
                            description: "Successful response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            transactionHash: {
                                                type: "string",
                                                description: "The transaction hash of the relayed transaction",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        "400": {
                            description: "Bad request",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "500": {
                            description: "Server error",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                },
            },
            "/api/twitter/btc-defuse-deposit": {
                get: {
                    operationId: "btcDefuseDepositUsingTwitter",
                    summary: "Deposits bitcoin into defuse",
                    description: `This method should only be called if the query is from twitter. If the query is from twitter, it shall contain the conversation id and explicitly say that this is a message from twitter. If you dont have the user account id, ask for it on twitter using send-message.,
                    Generates transaction link to deposit bitcoin into defuse or near intents. Take the amount in BTC, and not in satoshi from the users. Send the transaction Link along with required description to the user on twitter using send-message api.`,
                    parameters: [
                        {
                            name: "conversationId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The conversation id of the twitter chat"
                        },
                        {
                            name: "accountId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The NEAR account ID of the user"
                        },
                        {
                            name: "amount",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "amount to transfer. This can be either in bitcoin or satoshi. If possible understand and fill on your own."
                        },
                        {
                            name: "isAmountInBitcoin",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "'true' if amount is in bitcoin, 'false' if amount is in NEAR. This is very important. But try to fill it on your own."
                        },
                    ],
                    responses: {
                        "200": {
                            description: "Successful response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            link: {
                                                type: "string",
                                                description: "The link to send to the user on twitter"
                                            },
                                        },
                                    }
                                }
                            }
                        },
                        "400": {
                            description: "Bad request",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "500": {
                            description: "Server error",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                },
            },
            "/api/tools/btc-defuse-deposit": {
                get: {
                    operationId: "btcDefuseDeposit",
                    summary: "Deposits bitcoin into defuse",
                    description: "Generates transaction to deposit bitcoin into defuse or near intents. Take the amount in BTC, and not in satoshi from the users. After getting the response: 1) Make a link to https://wallet.bitte.ai/sign-transaction endpoint (I want you to make me sign the transaction using this endpoint instead of generate-transaction). Do fill in :transactionData with the data coming in response. This method should not be called if the message is from twitter.",
                    parameters: [
                        {
                            name: "accountId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The NEAR account ID of the user"
                        },
                        {
                            name: "amount",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "amount to transfer. This can be either in bitcoin or satoshi. If possible understand and fill on your own."
                        },
                        {
                            name: "isAmountInBitcoin",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "'true' if amount is in bitcoin, 'false' if amount is in NEAR. This is very important. But try to fill it on your own."
                        },
                        {
                            name: "callbackUrl",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: `call https://wallet.bitte.ai/sign-transaction?transactions_data=:transactionPayload&callback_url=http://${PLUGIN_URL}/api/tools/relay-transaction?data=:transactionData . Do fill in transactionData and transactionPayload with all the required params.`
                        },
                    ],
                    responses: {
                        "200": {
                            description: "Successful response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            transactionPayload: {
                                                type: "string",
                                                // description: "payload needs to be signed  and relay it through relayTransaction. This is transactions_data.",
                                            },
                                            transactionData: {
                                                type: "string",
                                                // description: "This transactionData needs to be sent to relayTransaction (no need to sign this)",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        "400": {
                            description: "Bad request",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "500": {
                            description: "Server error",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                },
            },
            "/api/twitter/create-near-transaction": {
                get: {
                    operationId: "createNearTransactionUsingTwitter",
                    summary: "Create a NEAR transaction link",
                    description: `This method should only be called if the query is from twitter. If the query is from twitter, it shall contain the conversation id and explicitly say that this is a message from twitter. If you dont have the user account id, ask for it on twitter using send-message.,
                    Generates a near transaction link for transferring tokens to another near wallet. Send the transaction Link along with required description to the user on twitter using send-message api.`,
                    parameters: [
                        {
                            name: "conversationId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The conversation id of the twitter chat"
                        },
                        {
                            name: "accountId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The NEAR account ID of the user"
                        },
                        {
                            name: "receiverId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The NEAR account ID of the receiver"
                        },
                        {
                            name: "amount",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The amount of NEAR tokens to transfer"
                        }
                    ],
                    responses: {
                        "200": {
                            description: "Successful response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            link: {
                                                type: "string",
                                                description: "The link to send to the user on twitter"
                                            },
                                        },
                                    }
                                }
                            }
                        },
                        "400": {
                            description: "Bad request",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "500": {
                            description: "Error response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "/api/tools/create-near-transaction": {
                get: {
                    operationId: "createNearTransaction",
                    summary: "Create a NEAR transaction payload",
                    description: "Generates a NEAR transaction payload for transferring tokens to be used directly in the generate-tx tool. This method should not be called if the message is from twitter.",
                    parameters: [
                        {
                            name: "receiverId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The NEAR account ID of the receiver"
                        },
                        {
                            name: "amount",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The amount of NEAR tokens to transfer"
                        }
                    ],
                    responses: {
                        "200": {
                            description: "Successful response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            transactionPayload: {
                                                type: "object",
                                                properties: {
                                                    receiverId: {
                                                        type: "string",
                                                        description: "The receiver's NEAR account ID"
                                                    },
                                                    actions: {
                                                        type: "array",
                                                        items: {
                                                            type: "object",
                                                            properties: {
                                                                type: {
                                                                    type: "string",
                                                                    description: "The type of action (e.g., 'Transfer')"
                                                                },
                                                                params: {
                                                                    type: "object",
                                                                    properties: {
                                                                        deposit: {
                                                                            type: "string",
                                                                            description: "The amount to transfer in yoctoNEAR"
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "400": {
                            description: "Bad request",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "500": {
                            description: "Error response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "/api/tools/get-crypto-prediction": {
                get: {
                    operationId: "randomCryptoPrediction",
                    summary: "Returns to user a random crypto prediction",
                    description: "Returns to user a random crypto prediction. Keep this as detailed as possible.",
                    parameters: [
                        {
                            name: "accountId",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The NEAR account ID of the receiver"
                        },
                    ],
                    responses: {
                        "200": {
                            description: "Successful response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "string",
                                        description: "The random crypto prediction which you need to tell the user."
                                    }
                                }
                            }
                        },
                        "400": {
                            description: "Bad request",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "500": {
                            description: "Error response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            error: {
                                                type: "string",
                                                description: "Error message"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
        },
    };

    return NextResponse.json(pluginData);
}