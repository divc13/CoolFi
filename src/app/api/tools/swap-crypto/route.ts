import { NextResponse } from 'next/server';
import { CrossChainSwapAndWithdrawParams} from "@/app/near-intent/types/intents";
import crypto from 'crypto';
import { getTokenBySymbol, getDefuseAssetId } from '@/app/near-intent/types/tokens';
import { convertAmountToDecimals } from '@/app/near-intent/types/tokens';
import { settings } from '@/app/config';
import { getNearNep141StorageBalance } from '@/app/near-intent/utils/deposit';
import type { IntentMessage } from '@/app/near-intent/types/intents';

const FT_MINIMUM_STORAGE_BALANCE_LARGE = settings.ft_minimum_storage_balance_large;


export async function withdrawFromDefuse(params: CrossChainSwapAndWithdrawParams): Promise<any> {
    try {
        const nonce = new Uint8Array(crypto.randomBytes(32));
        const nonceStr = Buffer.from(nonce).toString("base64");

        const token = getTokenBySymbol(params.defuse_asset_identifier_out);
        console.log("Token:", token);
        if (!token) {
            throw new Error(`Token ${params.defuse_asset_identifier_out} not found`);
        }
        const defuseAssetIdentifierOut = getDefuseAssetId(token);
        const defuseAssetOutAddrs = defuseAssetIdentifierOut.replace('nep141:', '')

        const amountInBigInt = convertAmountToDecimals(params.exact_amount_in, token);


        const nep141balance = await getNearNep141StorageBalance({
            contractId: defuseAssetOutAddrs,
            accountId: params.accountId
        });

        const storage_deposit: bigint = (nep141balance > BigInt(FT_MINIMUM_STORAGE_BALANCE_LARGE)) ? 0n : BigInt(FT_MINIMUM_STORAGE_BALANCE_LARGE);

        // Create intent message
        const intentMessage: IntentMessage = {
            signer_id: params.accountId,
            deadline: new Date(Date.now() + 300000).toISOString(), // 5 minutes from now
            intents: [{
                intent: "ft_withdraw",
                token: defuseAssetOutAddrs,
                receiver_id: params.destination_address,
                amount: amountInBigInt.toString(),
                memo: "",
                deposit: (storage_deposit).toString()
            }]
        };

        console.log("Intent message:", intentMessage);

        const messageString = JSON.stringify(intentMessage);
        const recipient = "intents.near";
 
        return {
            message: messageString,
            recipient,
            nonce: nonceStr
        }

    } catch (error) {
        console.error("Error in withdrawFromDefuse:", error);
        throw error;
    }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const exact_amount_in = searchParams.get('exact_amount_in');
    const defuse_asset_identifier_in = searchParams.get('defuse_asset_identifier_in');

    if (!accountId || !exact_amount_in || !defuse_asset_identifier_in) {
      return NextResponse.json({ error: 'some required parameters are missing' }, { status: 400 });
    }

    const params: CrossChainSwapAndWithdrawParams = {
      accountId: accountId,
      destination_address: accountId,
      exact_amount_in: exact_amount_in,
      defuse_asset_identifier_in: defuse_asset_identifier_in,
      defuse_asset_identifier_out: defuse_asset_identifier_in,
    };

    console.log('Params:', params);

    const transactionPayload = await withdrawFromDefuse(params);

    console.log('Transaction payload:', transactionPayload);

    return NextResponse.json(transactionPayload);


  } catch (error) {
  console.error('Error generating NEAR account details:', error);
  return NextResponse.json({ error: 'Failed to generate NEAR account details' }, { status: 500 });
}
}
