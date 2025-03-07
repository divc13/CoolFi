import { NextResponse } from 'next/server';
import { getTokenBySymbol } from '@/app/near-intent/types/tokens';
import { convertAmountToDecimals } from '@/app/near-intent/types/tokens';
import { getDefuseAssetId } from '@/app/near-intent/types/tokens';
import { getAllSupportedTokens } from '@/app/near-intent/types/tokens';
import { getQuote } from '@/app/near-intent/actions/crossChainSwap';
import { getTokenPriceUSD } from '@/app/near-intent/providers/coingeckoProvider';
import type { IntentMessage } from '@/app/near-intent/types/intents';
import { createTokenDiffIntent } from '@/app/near-intent/types/intents';
import crypto from 'crypto';
import { PLUGIN_URL } from '@/app/config';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenInName = searchParams.get('tokenIn');
    const tokenOutName = searchParams.get('tokenOut');
    const amountIn = searchParams.get('amountIn');
    const accountId = searchParams.get('accountId');
    const callback_url = searchParams.get('callback_url');

    if (!accountId) {
        throw new Error("NEAR_ADDRESS not configured");
    }

    console.log("Looking up tokens:", {
        tokenIn: tokenInName,
        tokenOut: tokenOutName
    });

    if (tokenInName === null || tokenOutName === null || amountIn === null) {
        throw new Error("Missing required parameters");
    }
    
    const defuseTokenIn = getTokenBySymbol(tokenInName);
    const defuseTokenOut = getTokenBySymbol(tokenOutName);

    console.log("Found tokens:", {
        defuseTokenIn,
        defuseTokenOut
    });
    
    if (!defuseTokenIn || !defuseTokenOut) {
        const supportedTokens = getAllSupportedTokens();
        throw new Error(`Token ${tokenInName} or ${tokenOutName} not found. Supported tokens: ${supportedTokens.join(', ')}`);
    }
    
    const amountInBigInt = convertAmountToDecimals(amountIn, defuseTokenIn);
    
    const defuseAssetIdIn = getDefuseAssetId(defuseTokenIn);
    const defuseAssetIdOut = getDefuseAssetId(defuseTokenOut);
    
    console.log("Defuse asset IDs:", {
        defuseAssetIdIn,
        defuseAssetIdOut
    });
    
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
    const profit:number = out_usd_price - in_usd_price;
    const profit_percent:number = ((Number(profit)) / Number(in_usd_price)) * 100;
    
    const returns = {
        net_return_usd: profit,
        return_percent: profit_percent 
    };
    
    const intentMessage: IntentMessage = {
        signer_id: accountId,
        deadline: new Date(Date.now() + 300000).toISOString(),
        intents: [createTokenDiffIntent(
            quote[best_quote_index].defuse_asset_identifier_in,
            quote[best_quote_index].defuse_asset_identifier_out,
            quote[best_quote_index].amount_in,
            quote[best_quote_index].amount_out
        )]
    };

    const messageString = intentMessage;
    const nonce = new Uint8Array(crypto.randomBytes(32));
    const recipient = "intents.near";
    const qoute_hash = quote[best_quote_index].quote_hash;
    const transactionPayload = {
        messageString, 
        nonce: Buffer.from(nonce).toString('base64'),
        recipient
    };

    const data:any = {
        messageString,
        recipient,
        nonce: encodeURIComponent(Buffer.from(nonce).toString('base64')),
        quote_hash: qoute_hash
    }

    if (callback_url)
    {
        const fetch_cb_url = `${callback_url}&exact_amount_in=${Number(quote[best_quote_index].amount_out) / 10 ** out_token_decimal}`;
        const cb_url_response = await fetch(fetch_cb_url);
        const cb_url =  await cb_url_response.json();
        data.callback_url = encodeURIComponent(`${cb_url.link}`);
    }

    console.log (Buffer.from(nonce).toString('base64'));

    const link = `https://wallet.bitte.ai/sign-message?message=${encodeURIComponent(JSON.stringify(messageString))}&nonce=${encodeURIComponent(transactionPayload.nonce)}&recipient=intents.near&callbackUrl=${PLUGIN_URL}/twitter/publish-intent?data=${encodeURIComponent(JSON.stringify(data))}`;
    
    console.log({link});
    
    return NextResponse.json(
        {
            link,
            returns
        }
    );
    
  } catch (error) {
    console.error('Error generating NEAR transaction payload:', error);
    return NextResponse.json({ error: 'Failed to generate NEAR transaction payload' }, { status: 500 });
  }
}
