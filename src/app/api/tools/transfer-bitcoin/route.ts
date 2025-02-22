import { NextResponse } from 'next/server';
import { withdrawFromDefuse }  from "@/app/near-intent/actions/crossChainSwap"
import { CrossChainSwapAndWithdrawParams} from "@/app/near-intent/types/intents";
import { Bitcoin } from '@/app/services/bitcoin';
import { Wallet } from '@/app/services/near-wallet';
import { MPC_CONTRACT } from '@/app/services/kdf/mpc';


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const exact_amount_in = searchParams.get('amount_in_satoshi');
    const receiverId = searchParams.get('receiverId');
    // const defuse_asset_identifier_out = searchParams.get('defuse_asset_identifier_out');
    // const function_access_key = searchParams.get('function_access_key');

    if (!accountId || !exact_amount_in) {
      return NextResponse.json({ error: 'some required parameters are missing' }, { status: 400 });
    }

    const path = "bitcoin-1";

    const BTC = new Bitcoin("mainnet");
    const { address, publicKey } = await BTC.deriveAddress(
      accountId,
      path
    );

    const balance = await BTC.getBalance({ address });
    const amount = Number(exact_amount_in);

    if (balance < amount) {
      return NextResponse.json({ error: 'insufficient balance' }, { status: 400 });
    }
    

    const wallet = new Wallet({networkId: "mainnet", createAccessKeyFor: MPC_CONTRACT});

    const { psbt, utxos } = await BTC.createTransaction({
      from: address,
      to: receiverId,
      amount,
    });
    console.log("PART 1 DONE!!!!");
    
    const TransactionToSign = await BTC.requestSignatureToMPC({
      wallet,
      path,
      psbt,
      utxos,
      publicKey,
    });

    // const payload = [{
    //   receiverId:"0.drop.proxy.mintbase.near",
    //   actions:[{
    //     type:"FunctionCall",
    //     params:{
    //       methodName:"mint",
    //       args:{
    //         metadata:"{\"media\":\"C6iWEOxKqUHJ2eAr5_3i0jyiYPLCcpUdoxRvM38xViM\",\"creatorAddress\":\"aurora-ahghara.near\",\"title\":\"\",\"description\":\"\"}",
    //         nft_contract_id:"drops.mintbase1.near"
    //       },
    //       gas:"200000000000000",
    //       deposit:"13500000000000000000000"
    //     }
    //   }]
    // }]

    console.log(TransactionToSign);
    // const txHash = await BTC.broadcastTX(signedTransaction);


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

    console.log(psbt.toBase64());

    const transactionData = JSON.stringify({pbst: btoa(psbt.toBase64()), utxos: utxos, receiverId: receiverId, amount: amount});

    console.log(transactionData);

    return NextResponse.json({ transactionPayload: encodeURI(JSON.stringify(TransactionToSign)), transactionData: transactionData });

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