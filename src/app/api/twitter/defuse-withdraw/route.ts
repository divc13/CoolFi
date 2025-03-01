import { NextResponse } from 'next/server';
import { CrossChainSwapAndWithdrawParams} from "@/app/near-intent/types/intents";
import crypto from 'crypto';
import { getTokenBySymbol, getDefuseAssetId } from '@/app/near-intent/types/tokens';
import { convertAmountToDecimals } from '@/app/near-intent/types/tokens';
import { PLUGIN_URL, settings } from '@/app/config';
import { getNearNep141StorageBalance } from '@/app/near-intent/utils/deposit';
import type { IntentMessage } from '@/app/near-intent/types/intents';
import { Bitcoin } from '@/app/services/bitcoin';

const FT_MINIMUM_STORAGE_BALANCE_LARGE = settings.ft_minimum_storage_balance_large;

async function withdrawFromDefuse(params: CrossChainSwapAndWithdrawParams): Promise<any> {
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
        var intentMessage: IntentMessage;
        if (params.defuse_asset_identifier_out.toUpperCase() == "BTC") {
          intentMessage = {
            signer_id: params.accountId,
            deadline: new Date(Date.now() + 300000).toISOString(), // 5 minutes from now
            intents: [{
                intent: "ft_withdraw",
                token: defuseAssetOutAddrs,
                receiver_id: defuseAssetOutAddrs,
                amount: amountInBigInt.toString(),
                memo: `WITHDRAW_TO:${params.destination_address}`,
                deposit: (storage_deposit).toString()
            }]
          };
        } else {
          intentMessage = {
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
        }

        console.log("Intent message:", intentMessage);

        const messageString = intentMessage;
        const recipient = "intents.near";
 
        return {
            messageString: messageString,
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
    const receiverId = searchParams.get('receiverId');
    const exact_amount_in = searchParams.get('exact_amount_in');
    const defuse_asset_identifier_in = searchParams.get('defuse_asset_identifier_in');

    if (!accountId || !exact_amount_in || !defuse_asset_identifier_in || !receiverId) {
      return NextResponse.json({ error: 'some required parameters are missing' }, { status: 400 });
    }
    
    var destination_address = receiverId;

    if (defuse_asset_identifier_in.toUpperCase() == "BTC") {
      const path = "bitcoin-1";
      const BTC = new Bitcoin("mainnet");
      
      const { address, publicKey } = await BTC.deriveAddress(
        receiverId,
        path
      );

      destination_address = address;
    }

    const params: CrossChainSwapAndWithdrawParams = {
      accountId: accountId,
      destination_address: receiverId,
      exact_amount_in: exact_amount_in,
      defuse_asset_identifier_in: defuse_asset_identifier_in,
      defuse_asset_identifier_out: defuse_asset_identifier_in,
    };

    console.log('Params:', params);

    const transactionPayload = await withdrawFromDefuse(params);
    const nonce_to_sign = transactionPayload.nonce;

    console.log('Transaction payload:', transactionPayload);

    const link = `https://wallet.bitte.ai/sign-message?message=${encodeURIComponent(JSON.stringify(transactionPayload.messageString))}&nonce=${(nonce_to_sign)}&recipient=intents.near&callbackUrl=${PLUGIN_URL}/redirect?data=${encodeURIComponent(JSON.stringify(transactionPayload))}`;
    console.log({link});
    return NextResponse.json({link});


  } catch (error) {
  console.error('Error generating NEAR account details:', error);
  return NextResponse.json({ error: 'Failed to generate NEAR account details' }, { status: 500 });
}
}
