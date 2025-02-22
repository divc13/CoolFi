import { NextResponse } from 'next/server';
import { withdrawFromDefuse }  from "@/app/near-intent/actions/crossChainSwap"
import { CrossChainSwapAndWithdrawParams} from "@/app/near-intent/types/intents";
import { Bitcoin } from '@/app/services/bitcoin';
import { Wallet } from '@/app/services/near-wallet';
import { MPC_CONTRACT } from '@/app/services/kdf/mpc';
import * as bitcoinJs from 'bitcoinjs-lib';
import { providers } from "near-api-js";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // const utxos = searchParams.get('utxos');
    // const signature = searchParams.get('signature');
    // const publicKey = searchParams.get('publicKey');
    const accountId = searchParams.get('account_id');
    const data = searchParams.get('data');
    const transactionHash = searchParams.get('transactionHashes');

    if (!data || !transactionHash || !accountId) {
      return NextResponse.json({ error: 'some required parameters are missing' }, { status: 400 });
    }
    console.log("data", data);
    console.log("transactionHash", transactionHash);
    console.log("accountId", accountId);
    console.log(JSON.parse(data));
    const jdata = JSON.parse(data);
    const npbst = atob(jdata.pbst);
    const nutxos = jdata.utxos;
    console.log("npbst", npbst);
    console.log("nutxos", nutxos);
    const pbst = bitcoinJs.Psbt.fromBase64(npbst);
    const utxos =  nutxos;
    const receiverId = jdata.receiverId;
    const amount = jdata.amount;

    // const near = new providers.JsonRpcProvider("https://rpc.mainnet.near.org");
    // const txDetails = await near.txStatus(transactionHash, accountId);
    // console.log(JSON.stringify(txDetails, null, 2));

    // const signatureBuffer = Buffer.from(signature, "base64");

    // // First 32 bytes → big_r
    // const big_r = signatureBuffer.slice(0, 32).toString("hex");

    // // Last 32 bytes → s
    // const s = signatureBuffer.slice(32, 64).toString("hex");
    const BTC = new Bitcoin("mainnet");
    const path = "bitcoin-1";

    const wallet = new Wallet({networkId: "mainnet", createAccessKeyFor: MPC_CONTRACT});
    const { address, publicKey } = await BTC.deriveAddress(
      accountId,
      path
    );

    const successValue = await wallet.getTransactionResult(transactionHash, accountId);
    const jsonString = Buffer.from(successValue, 'base64').toString('utf-8');

    // Step 2: Parse JSON
    const parsed = JSON.parse(jsonString).Ok;
    if (!parsed) {
       return NextResponse.json({ error: 'invalid signature' }, { status: 400 });
    }
    const big_r = parsed.big_r;
    const s = parsed.s;
    const rs = {big_r, s};

    console.log({npbst, nutxos, publicKey, rs, parsed, receiverId, amount});

    const new_pbst = await BTC.reconstructSignedTransactionFromCallback(rs, address, utxos, receiverId, amount, publicKey);
    const txHash = await BTC.broadcastTX(new_pbst);


    // const balance = await BTC.getBalance({ address });
    // const amount = Number(exact_amount_in);

    // if (balance < amount) {
    //   return NextResponse.json({ error: 'insufficient balance' }, { status: 400 });
    // }
    

    // const wallet = new Wallet({networkId: "mainnet", createAccessKeyFor: MPC_CONTRACT});

    // const { psbt, utxos } = await BTC.createTransaction({
    //   from: address,
    //   to: receiverId,
    //   amount,
    // });
    // console.log("PART 1 DONE!!!!");
    
    // const TransactionToSign = await BTC.requestSignatureToMPC({
    //   wallet,
    //   path,
    //   psbt,
    //   utxos,
    //   publicKey,
    // });

    // console.log(TransactionToSign);
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

    return NextResponse.json({ txHash });

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