import { ACCOUNT_ID, PLUGIN_URL } from "@/app/config";
import { NextResponse } from "next/server";

export async function GET() {
    const pluginData = {
        openapi: "3.1.0",
        info: {
            title: "Boilerplate",
            description: "API for the boilerplate",
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
                name: "CoolFi",
                description: "A blockchain assistant that provides information, retrieves the user's account ID, interacts with Twitter, creates NEAR transaction payloads, and helps with crypto swaps.",
                instructions: `You assist with NEAR transactions, blockchain queries, account retrieval, Twitter interactions, and coin flips.
                For blockchain transactions:
                1. Generate a transaction payload using "/api/tools/create-near-transaction".
                2. Use the 'generate-transaction' tool to execute the transaction.
                For crypto swaps:
                1. Retrieve the swap intent message using "/api/tools/swap-crypto".
                2. Sign the intent using the 'sign-message' tool.
                3. Publish the signed intent using "/api/tools/publish-intent".
                Both retrieval and publishing steps are required to complete a swap.`,
                tools: [{ type: "generate-transaction" }, { type: "sign-message" }]
            },
        },
        paths: {
            // "/api/tools/swap-crypto": {
            //     get: {
            //         operationId: "swapCrypto",
            //         summary: "Swap the crpto based on user inputss",
            //         description: "The user will give the input and the output crypto and the amount to swap",
            //         parameters: [
            //             {
            //                 name: "accountId",
            //                 in: "query",
            //                 required: true,
            //                 schema: {
            //                     type: "string"
            //                 },
            //                 description: "The NEAR account ID of the user"
            //             },
            //             {
            //                 name: "exact_amount_in",
            //                 in: "query",
            //                 required: true,
            //                 schema: {
            //                     type: "string"
            //                 },
            //                 description: "The amount of input crypto which user wants to swap"
            //             },
            //             {
            //                 name: "defuse_asset_identifier_in",
            //                 in: "query",
            //                 required: true,
            //                 schema: {
            //                     type: "string"
            //                 },
            //                 description: "The input crypto which user wants to swap"
            //             },
            //             {
            //                 name: "defuse_asset_identifier_out",
            //                 in: "query",
            //                 required: true,
            //                 schema: {
            //                     type: "string"
            //                 },
            //                 description: "The output crypto which user wants to receive from the swap"
            //             },
            //             {
            //                 name: "function_access_key",
            //                 in: "query",
            //                 required: true,
            //                 schema: {
            //                     type: "string"
            //                 },
            //                 description: "A function access key in browser local storage to call functions in order to look at user balance (this wont and cannot be used to transfer funds from the user account)"
            //             },
            //         ],
            //         responses: {
            //             "200": {
            //                 description: "Successful response",
            //                 content: {
            //                     "application/json": {
            //                         schema: {
            //                             type: "object",
            //                             properties: {
            //                                 intents: {
            //                                     type: "object",
            //                                     properties: {
            //                                         receiverId: {
            //                                             type: "string",
            //                                             description: "The user's NEAR account ID"
            //                                         },
            //                                         actions: {
            //                                             type: "array",
            //                                             items: {
            //                                                 type: "object",
            //                                                 properties: {
            //                                                     type: {
            //                                                         type: "string",
            //                                                         description: "The type of action (e.g., 'Transfer', 'Withdraw')"
            //                                                     },
            //                                                     params: {
            //                                                         type: "object",
            //                                                         properties: {
            //                                                             deposit: {
            //                                                                 type: "string",
            //                                                                 description: "The amount to transfer/withdraw in yoctoNEAR"
            //                                                             }
            //                                                         }
            //                                                     }
            //                                                 }
            //                                             }
            //                                         }
            //                                     }
            //                                 }
            //                             }
            //                         }
            //                     }
            //                 }
            //             },
            //             "400": {
            //                 description: "Bad request",
            //                 content: {
            //                     "application/json": {
            //                         schema: {
            //                             type: "object",
            //                             properties: {
            //                                 error: {
            //                                     type: "string",
            //                                     description: "Error message"
            //                                 }
            //                             }
            //                         }
            //                     }
            //                 }
            //             },
            //             "500": {
            //                 description: "Error response",
            //                 content: {
            //                     "application/json": {
            //                         schema: {
            //                             type: "object",
            //                             properties: {
            //                                 error: {
            //                                     type: "string",
            //                                     description: "Error message"
            //                                 }
            //                             }
            //                         }
            //                     }
            //                 }
            //             }
            //         }
            //     },
            // },
            "/api/tools/swap-crypto": {
                get: {
                    operationId: "swapCrypto",
                    summary: "Retrieve a message to swap cryptocurrency.",
                    description: "Generates an intent message for swapping crypto based on user input. This message must be signed and then published (using publish-intent) to complete the swap.",
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
                                            transactionPayload: {
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
                                                        description: "The unique identifier for the transaction."
                                                    },

                                                    // actions: {
                                                    //     type: "array",
                                                    //     items: {
                                                    //         type: "object",
                                                    //         properties: {
                                                    //             type: {
                                                    //                 type: "string",
                                                    //                 description: "The type of action (e.g., 'Transfer')"
                                                    //             },
                                                    //             params: {
                                                    //                 type: "object",
                                                    //                 properties: {
                                                    //                     signer_id: {
                                                    //                         type: "string",
                                                    //                         description: "The account of user"
                                                    //                     },
                                                    //                     deadline: {
                                                    //                         type: "string",
                                                    //                         description: "The deadline to sign the intent"
                                                    //                     },
                                                    //                     intents: {
                                                    //                         type: "array",
                                                    //                         items: {
                                                    //                             type: "object",
                                                    //                             properties: {
                                                    //                                 intent: {
                                                    //                                     type: "string",
                                                    //                                     description: "The intent of the transaction"
                                                    //                                 },
                                                    //                                 token: {
                                                    //                                     type: "string",
                                                    //                                     description: "The token to transfer"
                                                    //                                 },
                                                    //                                 receiver_id: {
                                                    //                                     type: "string",
                                                    //                                     description: "The receiver of the tokens"
                                                    //                                 },
                                                    //                                 amount: {
                                                    //                                     type: "string",
                                                    //                                     description: "The amount of tokens of the input token to transfer"
                                                    //                                 },
                                                    //                             }
                                                    //                         }
                                                    //                     }
                                                    //                 }
                                                    //             }
                                                    //         }
                                                    //     }
                                                    // }
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
                },
            },
            "/api/tools/publish-intent": {
                get: {
                    operationId: "publishIntent",
                    summary: "Publish a signed crypto swap intent.",
                    description: "Finalizes the crypto swap by submitting the signed intent message. The public key should be automatically extracted from the signing result - typically available in the response from the signing process as 'signResult.publicKey'.",
                    parameters: [
                        {
                            name: "signature",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The cryptographic signature generated for the intent message in the form of a hexadecimal string. This is automatically available after signing - no need to ask the user. Example format: 'ed25519:58dqv4nGcXaXE7Hou13b8BKhq466f86EnvKHZJGBK3MPTL4PggFZZ9aNmVnfkH3n1qZi9Q6hGbsTaG8uXTmoGemN'"
                        },
                        {
                            name: "publicKey",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The ed25519 public key from the signing result (signResult.publicKey). This is automatically available after signing - no need to ask the user. DO NOT use the NEAR wallet ID (like 'user.near'). Example format: 'ed25519:HeaBJ3xLgvZacQWmEctTeUqyfSU4SDEnEwckWxd92W2G'"
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
                            description: "The unique nonce value from the intent message. This must match the nonce used in the signing process just converted into base64 string (Buffer.from(nonce).toString('base64'))."
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
            "/api/tools/get-account-details": {
                get: {
                    operationId: "getAcountDetails",
                    summary: "get user wallet details",
                    description: "Respond with user wallet details",
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
            "/api/tools/get-blockchains": {
                get: {
                    summary: "get blockchain information",
                    description: "Respond with a list of blockchains",
                    operationId: "get-blockchains",
                    responses: {
                        "200": {
                            description: "Successful response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            message: {
                                                type: "string",
                                                description: "The list of blockchains",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            "/api/tools/get-user": {
                get: {
                    summary: "get user information",
                    description: "Respond with user account ID",
                    operationId: "get-user",
                    responses: {
                        "200": {
                            description: "Successful response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            accountId: {
                                                type: "string",
                                                description: "The user's account ID",
                                            },
                                            evmAddress: {
                                                type: "string",
                                                description: "The user's MPC EVM address",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            "/api/tools/twitter": {
                get: {
                    operationId: "getTwitterShareIntent",
                    summary: "Generate a Twitter share intent URL",
                    description: "Creates a Twitter share intent URL based on provided parameters",
                    parameters: [
                        {
                            name: "text",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The text content of the tweet"
                        },
                        {
                            name: "url",
                            in: "query",
                            required: false,
                            schema: {
                                type: "string"
                            },
                            description: "The URL to be shared in the tweet"
                        },
                        {
                            name: "hashtags",
                            in: "query",
                            required: false,
                            schema: {
                                type: "string"
                            },
                            description: "Comma-separated hashtags for the tweet"
                        },
                        {
                            name: "via",
                            in: "query",
                            required: false,
                            schema: {
                                type: "string"
                            },
                            description: "The Twitter username to attribute the tweet to"
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
                                            twitterIntentUrl: {
                                                type: "string",
                                                description: "The generated Twitter share intent URL"
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
            "/api/tools/create-near-transaction": {
                get: {
                    operationId: "createNearTransaction",
                    summary: "Create a NEAR transaction payload",
                    description: "Generates a NEAR transaction payload for transferring tokens to be used directly in the generate-tx tool",
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
            "/api/tools/create-evm-transaction": {
                get: {
                    operationId: "createEvmTransaction",
                    summary: "Create EVM transaction",
                    description: "Generate an EVM transaction payload with specified recipient and amount to be used directly in the generate-evm-tx tool",
                    parameters: [
                        {
                            name: "to",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The EVM address of the recipient"
                        },
                        {
                            name: "amount",
                            in: "query",
                            required: true,
                            schema: {
                                type: "string"
                            },
                            description: "The amount of ETH to transfer"
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
                                            evmSignRequest: {
                                                type: "object",
                                                properties: {
                                                    to: {
                                                        type: "string",
                                                        description: "Receiver address"
                                                    },
                                                    value: {
                                                        type: "string",
                                                        description: "Transaction value"
                                                    },
                                                    data: {
                                                        type: "string",
                                                        description: "Transaction data"
                                                    },
                                                    from: {
                                                        type: "string",
                                                        description: "Sender address"
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
                    }
                }
            },
            "/api/tools/coinflip": {
                get: {
                    summary: "Coin flip",
                    description: "Flip a coin and return the result (heads or tails)",
                    operationId: "coinFlip",
                    responses: {
                        "200": {
                            description: "Successful response",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            result: {
                                                type: "string",
                                                description: "The result of the coin flip (heads or tails)",
                                                enum: ["heads", "tails"]
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