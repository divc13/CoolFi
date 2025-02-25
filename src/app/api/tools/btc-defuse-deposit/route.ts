import { NextResponse } from 'next/server';
import { Bitcoin } from '@/app/services/bitcoin';
import { Wallet } from '@/app/services/near-wallet';
import { MPC_CONTRACT } from '@/app/services/kdf/mpc';
import { convertBitcoin } from '@/app/services/utils';
import { request as REQ } from '@/app/near-intent/utils/deposit';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const amountInURL = searchParams.get('amount');
    const isAmountInBitcoin = searchParams.get('isAmountInBitcoin');
    // const defuse_asset_identifier_out = searchParams.get('defuse_asset_identifier_out');
    // const function_access_key = searchParams.get('function_access_key');
    
    if (!accountId || !amountInURL || !isAmountInBitcoin ) {
      console.log('some required parameters are missing');
      console.log({accountId, amountInURL, isAmountInBitcoin});
      return NextResponse.json({ error: 'some required parameters are missing' }, { status: 400 });
    }

    console.log({accountId, amountInURL, isAmountInBitcoin});

    const path = "bitcoin-1";
    const BTC = new Bitcoin("mainnet");
    
    var exact_amount_in = amountInURL;
    if (isAmountInBitcoin == 'true') {
      exact_amount_in = convertBitcoin(Number(amountInURL), 'sats');
    }

    const deposit_address = await REQ("https://bridge.chaindefuser.com/rpc",
    {
      "jsonrpc": "2.0",
      "id": "dontcare",
      "method": "deposit_address", 
      "params": [ 
        {
          "account_id":  `${accountId}`,
          "chain": "btc:mainnet"
        }
      ]
    });

    if (deposit_address == null) {
        return NextResponse.json({ error: 'Failed to generate deposit address' }, { status: 401 });   
    }
    
    var recepient = (await deposit_address.json()).result.address;

    if (recepient == null) {
        return NextResponse.json({ error: 'Failed to generate recepient address' }, { status: 402 });   
    }

    const { address, publicKey } = await BTC.deriveAddress(
      accountId,
      path
    );

    if (address == null || publicKey == null) {
        return NextResponse.json({ error: 'Failed to get derived address or public Key' }, { status: 403 });   
    }

    const balance = await BTC.getBalance({ address });
    if (balance == null) {
        return NextResponse.json({ error: 'Failed to get balance' }, { status: 404 });   
    }

    const amount = Number(exact_amount_in);

    if (balance < amount) {
      return NextResponse.json({ error: 'insufficient balance' }, { status: 405 });
    }

    const wallet = new Wallet({networkId: "mainnet", createAccessKeyFor: MPC_CONTRACT});

    console.log({address, recepient, amount});

    const { psbt, utxos } = await BTC.createTransaction({
      from: address,
      to: recepient,
      amount,
    });

    if (psbt == null || utxos == null) {
        return NextResponse.json({ error: 'Failed to create transaction' }, { status: 406 });   
    }
    
    const TransactionToSign = await BTC.requestSignatureToMPC({
      wallet,
      path,
      psbt,
      utxos,
      publicKey,
    });

    console.log(TransactionToSign);
    if (TransactionToSign == null) {
        return NextResponse.json({ error: 'Failed to get transaction load' }, { status: 407 });
    }

    const transactionData = JSON.stringify({pbst: btoa(psbt.toBase64()), utxos: utxos, receiverId: recepient, amount: amount});
    console.log(transactionData);

    return NextResponse.json({ transactionPayload: encodeURI(JSON.stringify(TransactionToSign)), transactionData: transactionData });

  } catch (error) {
    console.error('Error generating BTC transaction payload:', error);
    return NextResponse.json({ error: 'Failed to generate BTC transaction payload' }, { status: 500 });
  }
}
