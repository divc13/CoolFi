import { NextResponse } from 'next/server';
import { Near, transactions } from "near-api-js"
import { Transaction } from '@/app/near-intent/types/deposit';
import { FT_DEPOSIT_GAS } from '@/app/near-intent/utils/deposit';
import { convertBigIntToString } from '@/app/near-intent/actions/crossChainSwap';
import { connect } from "near-api-js";
import { settings } from "@/app/config";

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

    console.log("Public Keys already registered are as follows");
    console.log(result);

    return new Set(result);
}

export async function GET(request: Request) {
    try {
      const { searchParams } = new URL(request.url);
        const publicKey = searchParams.get('publicKey');
        // const publicKey = "ed25519:DTxNukPxWf3g4NWUdL6oGWeVkh4jdsQHt3MF8UrkgrAH";
        const accountId = searchParams.get('accountId');

        if (!accountId || !publicKey) {
            throw new Error(`Account id or publicKey is not available. Kindly try connecting wallet. `);
        }

        const existingKeys = await getPublicKeysOf(accountId);
        console.log(existingKeys);
        if (existingKeys.has(publicKey))
        {
            return NextResponse.json({info: "Already registered"}, { status: 201 });
        }

        const transaction:Transaction["NEAR"][] = [{
            receiverId: "intents.near",
            actions: [
                transactions.functionCall(
                    "add_public_key",
                    {
                        public_key: publicKey
                    },
                    BigInt(FT_DEPOSIT_GAS),
                    BigInt(1)
                )
            ]}
        ]

        var tx = await convertBigIntToString(transaction);
        return NextResponse.json({ tx }, { status: 200 });

  } catch (error) {
    console.error('Error generating register key transaction:', error);
    return NextResponse.json({ error: 'Failed to generate NEAR account details' }, { status: 500 });
  }
}