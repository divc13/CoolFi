import { NextResponse } from 'next/server';
import { crossChainSwap, WalletProvider, withdrawFromDefuse } from '../../../../../near-intent/src';
import { utils as nearUtils } from "near-api-js";
import { connect, keyStores, transactions } from "near-api-js";
import crypto from "crypto";
import { getAllSupportedTokens, getDefuseAssetId, getTokenBySymbol, isTokenSupported, SingleChainToken, UnifiedToken, convertAmountToDecimals } from "../../../../../near-intent/src/types/tokens";
import { CrossChainSwapParams, createTokenDiffIntent, IntentMessage, IntentStatus,
  PublishIntentRequest, PublishIntentResponse, QuoteRequest, QuoteResponse,
  CrossChainSwapAndWithdrawParams, NativeWithdrawIntent} from "../../../../../near-intent/src/types/intents";
import { ensurePublicKeyRegistered, pollIntentStatus, publishIntent } from "../../../../../near-intent/src/actions/crossChainSwap";
import bs58 from 'bs58';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const signature = searchParams.get('signature');
    const publicKey = searchParams.get('publicKey');
    const messageString = searchParams.get('message');
    const recipient = searchParams.get('receiverId');
    const nonce = searchParams.get('nonce');

    if (!signature || !publicKey || !messageString || !recipient || !nonce) {
      console.log('Missing parameters:', { signature, publicKey, messageString, recipient, nonce });
      console.log('Nonce length:', nonce);
      return NextResponse.json({ error: 'some required parameters are missing' }, { status: 400 });
    }

    console.log('Received parameters:', { signature, publicKey, messageString, recipient, nonce }, nonce.length);

    await ensurePublicKeyRegistered(publicKey);
    const prefix = "ed25519:";
    const cleaned = publicKey.startsWith(prefix) ? publicKey.slice(prefix.length) : publicKey;

    const signatureBuffer = bs58.encode(Buffer.from(signature, "base64"));
    const publicKeyBuffer = bs58.encode(Buffer.from(cleaned, "base64"));

    // Publish intent
    const intent = await publishIntent({
        quote_hashes: [], // Empty for withdrawals
        signed_data: {
            payload: {
                message: messageString,
                nonce: nonce,
                recipient
            },
            standard: "nep413",
            signature: `ed25519:${signatureBuffer}`,
            public_key: `${publicKey}`
        }
    });
    console.log('Intent:', intent);

    if (intent.status === "OK") {
        const finalStatus = await pollIntentStatus(intent.intent_hash);
        return NextResponse.json(finalStatus);
    }
    return NextResponse.json(intent);
    
    // const config = {
    //   networkId: 'mainnet',
    //   keyStore: new keyStores.BrowserLocalStorageKeyStore(),
    //   nodeUrl: 'https://rpc.mainnet.near.org',
    //   walletUrl: 'https://wallet.near.org',
    //   helperUrl: 'https://helper.mainnet.near.org',
    // };

    // // Connect to NEAR
    // const near = await connect(config);
    // const wallet = new nearApi.WalletConnection(near);

    // // Check if user is signed in
    // if (!wallet.isSignedIn()) {
    //     // Redirect to NEAR wallet for signing in
    //     wallet.requestSignIn({
    //         contractId: 'intents.near',
    //         methodNames: [], // Add relevant method names if needed
    //     });
    //     return;
    // }

    // const wallet = some_logic()

    // const transactionPayload = {
    //   receiverId,
    //   actions: [
    //     {
    //       type: 'intent',
    //       params: {
    //         signer_id: accountId,
    //         deadline: new Date(Date.now() + 300000).toISOString(),
    //         intents: [{
    //           intent: "transfer",
    //           token: defuse_asset_identifier_in,
    //           receiver_id: receiverId,
    //           amount: nearUtils.format.parseNearAmount(exact_amount_in),
    //         }]
    //       },
    //     },
    //   ],
    // };

    // const amount = nearUtils.format.parseNearAmount(exact_amount_in);

    //     if (!amountInYoctoNEAR) {
    //       return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    //     }

    //     const transactionPayload = {
    //       receiverId,
    //       actions: [
    //         {
    //           type: 'Transfer',
    //           params: {
    //             deposit: amountInYoctoNEAR,
    //           },
    //         },
    //       ],
    //     };

    return NextResponse.json({ transactionPayload: "transactionPayload" });

    // const intentMessage = {
    //   signer_id: accountId,
    //   deadline: new Date(Date.now() + 300000).toISOString(),
    //   intents: [{
    //     intent: "transfer",
    //     token: defuse_asset_identifier_in,
    //     receiver_id: receiverId,
    //     amount: nearUtils.format.parseNearAmount(exact_amount_in),
    //   }]
    // };

    // const messageString = JSON.stringify(intentMessage);
    // const recipient = "intents.near";
    // const nonce = new Uint8Array(crypto.randomBytes(32));
    // const messageBuffer = new TextEncoder().encode(messageString);

    // const intents = await crossChainSwap({
    //   accountId: accountId,
    //   exact_amount_in: exact_amount_in,
    //   defuse_asset_identifier_in: defuse_asset_identifier_in,
    //   defuse_asset_identifier_out: defuse_asset_identifier_out,
    //   function_access_key: function_access_key,
    // });

    // try {
    // // Sign the message using the wallet
    // const signedMessage = await wallet.account().signMessage(
    //     messageString,
    //     recipient,
    //     nonce
    // );

    // // Publish the intent
    // const response = await fetch('https://api.intents.near.org/publish', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //         quote_hashes: [], // Empty for withdrawals
    //         signed_data: {
    //             payload: {
    //                 message: messageString,
    //                 nonce: Buffer.from(nonce).toString('base64'),
    //                 recipient
    //             },
    //             standard: "nep413",
    //             signature: `ed25519:${signedMessage.signature}`,
    //             public_key: `ed25519:${signedMessage.publicKey}`
    //         }
    //     })
    // });


    //   // const intent = await response.json();
    //   return { message: "intent" };

    //   // return NextResponse.json({ 
    //   //     message: messageString,
    //   //     recipient,
    //   //     nonce,
    //   //  }, { status: 200 });
    // } catch (error) {
    //   console.error('Error generating NEAR account details:', error);
    //   return NextResponse.json({ error: 'Failed to generate NEAR account details' }, { status: 500 });
    // }

  } catch (error) {
  console.error('Error generating NEAR account details:', error);
  return NextResponse.json({ error: 'Failed to generate NEAR account details' }, { status: 500 });
}
}


// 'use client'
// async function some_logic() {
//   const config = {
//     networkId: 'mainnet',
//     keyStore: new keyStores.BrowserLocalStorageKeyStore(),
//     nodeUrl: 'https://rpc.mainnet.near.org',
//     walletUrl: 'https://wallet.near.org',
//     helperUrl: 'https://helper.mainnet.near.org',
//   };

//   // Connect to NEAR
//   const near = await connect(config);
//   const wallet = new (window as any).nearApi.WalletConnection(near);

//   // Check if user is signed in
//   if (!wallet.isSignedIn()) {
//       // Redirect to NEAR wallet for signing in
//       wallet.requestSignIn({
//           contractId: 'intents.near',
//           methodNames: [], // Add relevant method names if needed
//       });
//       return;
//   }
//   return wallet;
// }