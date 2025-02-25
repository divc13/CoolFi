import { NextResponse } from 'next/server';
import { parseNearAmount } from 'near-api-js/lib/utils/format';
import { settings } from '@/app/config';
import { getTokenBySymbol } from '@/app/near-intent/types/tokens';
import { convertAmountToDecimals } from '@/app/near-intent/types/tokens';
import { getNearNep141StorageBalance } from '@/app/near-intent/utils/deposit';
import { createBatchDepositNearNep141Transaction } from '@/app/near-intent/utils/deposit';
import { createBatchDepositNearNativeTransaction } from '@/app/near-intent/utils/deposit'; 
import { getDefuseAssetId } from '@/app/near-intent/types/tokens';
import { getAllSupportedTokens } from '@/app/near-intent/types/tokens';
import { SendTransactionNearParams } from '@/app/near-intent/types/deposit';
import { Transaction } from '@/app/near-intent/types/deposit';
import { Action } from '@near-wallet-selector/core';

const FT_MINIMUM_STORAGE_BALANCE_LARGE = "1250000000000000000000";
                  
function convertBigIntToString(jsonArray:any) {
    return JSON.parse(JSON.stringify(jsonArray, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
    ));
}

const depositIntoDefuse = async (tokenIds: string[], amount: bigint) : Promise<Transaction["NEAR"][]> => {
    const contractId = tokenIds[0].replace('nep141:', '');

    const nep141balance = await getNearNep141StorageBalance({
        contractId,
        accountId: settings.accountId
    });

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
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenInName = searchParams.get('tokenIn');
    const amount = searchParams.get('amount');

    if (tokenInName === null || amount === null) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const accountId = settings.accountId;
    const network = "near";

    if (!accountId) {
        throw new Error("NEAR_ADDRESS not configured");
    }

    console.log("Looking up tokens:", { tokenIn: tokenInName, });

    const defuseTokenIn = getTokenBySymbol(tokenInName || "");

    
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
    
    var transactions: Transaction["NEAR"][] = await depositIntoDefuse([defuseAssetIdIn], amountInBigInt);
    transactions = await convertBigIntToString(transactions);
    return NextResponse.json({ transactions });

    
  } catch (error) {
    console.error('Error generating NEAR transaction payload:', error);
    return NextResponse.json({ error: 'Failed to generate NEAR transaction payload' }, { status: 500 });
  }
}
