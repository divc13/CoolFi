import { NextResponse } from 'next/server';
import { getTokenBySymbol } from '@/app/near-intent/types/tokens';
import { convertAmountToDecimals } from '@/app/near-intent/types/tokens';
import { getNearNep141StorageBalance } from '@/app/near-intent/utils/deposit';
import { createBatchDepositNearNep141Transaction } from '@/app/near-intent/utils/deposit';
import { createBatchDepositNearNativeTransaction } from '@/app/near-intent/utils/deposit'; 
import { getDefuseAssetId } from '@/app/near-intent/types/tokens';
import { getAllSupportedTokens } from '@/app/near-intent/types/tokens';
import { Transaction } from '@/app/near-intent/types/deposit';
import { sendDM } from '../sendMessage';
import { PLUGIN_URL } from '@/app/config';
import {request as REQ} from '@/app/near-intent/utils/deposit';

const FT_MINIMUM_STORAGE_BALANCE_LARGE = "1250000000000000000000";
                  
function convertBigIntToString(jsonArray:any) {
    return JSON.parse(JSON.stringify(jsonArray, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
    ));
}

const depositIntoDefuse = async (tokenIds: string[], amount: bigint, accountId: string) : Promise<Transaction["NEAR"][]> => {
    const contractId = tokenIds[0].replace('nep141:', '');

    const nep141balance = await getNearNep141StorageBalance({
        contractId,
        accountId: accountId
    });

    var transaction;
    if(contractId === "wrap.near")
    {
        transaction = createBatchDepositNearNativeTransaction(contractId, amount, !(nep141balance >= BigInt(FT_MINIMUM_STORAGE_BALANCE_LARGE)), BigInt(FT_MINIMUM_STORAGE_BALANCE_LARGE), amount > 0n, amount);
    }
    else
    {
        transaction = createBatchDepositNearNep141Transaction(contractId, amount, !(nep141balance >= BigInt(FT_MINIMUM_STORAGE_BALANCE_LARGE)), BigInt(FT_MINIMUM_STORAGE_BALANCE_LARGE));
    }

    return transaction;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const tokenInName = searchParams.get('tokenIn');
    const amount = searchParams.get('amount');
    const accountId = searchParams.get('accountId');

    if (tokenInName === null || amount === null || conversationId === null) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (!accountId) {
        throw new Error("NEAR_ADDRESS not configured");
    }

    console.log("Looking up tokens:", { tokenIn: tokenInName, });

    const defuseTokenIn = getTokenBySymbol(tokenInName);

    
    console.log("Found tokens:", {
        defuseTokenIn,
    });

     if (!defuseTokenIn) {
        const supportedTokens = getAllSupportedTokens();
        throw new Error(`Token ${tokenInName} is not found. Supported tokens: ${supportedTokens.join(', ')}`);
    }
    
    const defuseAssetIdIn = getDefuseAssetId(defuseTokenIn);
    console.log("Defuse asset IDs:", {
        defuseAssetIdIn,
    });

    if (!defuseTokenIn) {
        return NextResponse.json({ error: 'Token not found' }, { status: 400 });
    }

    const amountInBigInt = convertAmountToDecimals(amount, defuseTokenIn);
    
    var transactions = await depositIntoDefuse([defuseAssetIdIn], amountInBigInt, accountId);
    transactions = await convertBigIntToString(transactions);
    
    var modified_txns:any = [];
    for (var tx of transactions)
    {
        var mod_txn = {};
        mod_txn["receiverId"] = tx.receiverId;
        mod_txn["signerId"] = accountId;
        var mod_actions:any = [];
        for (var action of tx.actions)
        {
            console.log(action);
            var mod_action = {};
            mod_action["type"] = "FunctionCall";
            var params:any = {};
            params["methodName"] = action.functionCall?.methodName;
            params["deposit"] = action.functionCall?.deposit;
            params["gas"] = action.functionCall?.gas;

            const args = action.functionCall?.args["data"];
            if (!args) {
                throw ("No args");
            }
            const uint8Array = args instanceof Uint8Array ? args : new Uint8Array(args);
            const decoder = new TextDecoder();
            const jsonString = decoder.decode(uint8Array);
            params["args"] = JSON.parse(jsonString);
            mod_action["params"] = params;
            mod_actions.push(mod_action);
        }
        mod_txn["actions"] = mod_actions;
        modified_txns.push(mod_txn);
    }

    const link = `https://wallet.bitte.ai/sign-transaction?transactions_data=${encodeURI(JSON.stringify(modified_txns))}&callback_url=${PLUGIN_URL}`;  ;

    console.log({ link });

    return NextResponse.json({ link });
    
  } catch (error) {
    console.error('Error generating NEAR transaction payload:', error);
    return NextResponse.json({ error: 'Failed to generate NEAR transaction payload' }, { status: 500 });
  }
}
