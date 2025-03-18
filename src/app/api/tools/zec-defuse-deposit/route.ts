import { NextResponse } from 'next/server';
import { ZCash } from '@/app/services/zcash';
import { Wallet } from '@/app/services/near-wallet';
import { MPC_CONTRACT } from '@/app/services/kdf/mpc';
import { convertZCash } from '@/app/services/utils';
import { request as REQ } from '@/app/near-intent/utils/deposit';
import { PLUGIN_URL } from '@/app/config';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const amountInURL = searchParams.get('amount');
    const isAmountInZEC = searchParams.get('isAmountInZEC');
    // const defuse_asset_identifier_out = searchParams.get('defuse_asset_identifier_out');
    // const function_access_key = searchParams.get('function_access_key');
    
    if (!accountId || !amountInURL || !isAmountInZEC ) {
      console.log('some required parameters are missing');
      console.log({accountId, amountInURL, isAmountInZEC});
      return NextResponse.json({ error: 'some required parameters are missing' }, { status: 400 });
    }

    console.log({accountId, amountInURL, isAmountInZEC});

    const path = "";
    const ZEC = new ZCash("mainnet");
    
    var exact_amount_in = amountInURL;
    if (isAmountInZEC == 'true') {
      exact_amount_in = convertZCash(Number(amountInURL), 'zats');
    }

    const deposit_address = await REQ("https://bridge.chaindefuser.com/rpc",
    {
      "jsonrpc": "2.0",
      "id": "dontcare",
      "method": "deposit_address", 
      "params": [ 
        {
          "account_id":  `${accountId}`,
          "chain": "zec:mainnet"
        }
      ]
    });

    var recepient = (await deposit_address.json()).result.address;

    const { address, publicKey } = await ZEC.deriveAddress(
      accountId,
      path
    );

    const balance = await ZEC.getBalance({ address });
    const amount = Number(exact_amount_in);

    if (balance < amount) {
      return NextResponse.json({ error: 'insufficient balance' }, { status: 400 });
    }

    const wallet = new Wallet({networkId: "mainnet", createAccessKeyFor: MPC_CONTRACT});

    console.log({address, recepient, amount});

    const { psbt, utxos } = await ZEC.createTransaction({
      from: address,
      to: recepient,
      amount,
    });

    if (!psbt || !utxos) {
      return NextResponse.json({ error: 'Failed to create zcash transaction' }, { status: 400 });
    }
    
    console.log("PART 1 DONE!!!!");
    
    const TransactionToSign = await ZEC.requestSignatureToMPC({
      wallet,
      path,
      psbt,
      utxos,
      publicKey,
    });

    console.log(TransactionToSign);

    const transactionData = JSON.stringify({pbst: btoa(psbt.toBase64()), utxos: utxos, receiverId: recepient, amount: amount});

    console.log(transactionData);

    const link = `https://wallet.bitte.ai/sign-transaction?transactions_data=${encodeURI(JSON.stringify(TransactionToSign))}&callback_url=${PLUGIN_URL}/api/tools/relay-transaction?data=${transactionData}`;

    return NextResponse.json({ link });

  } catch (error) {
    console.error('Error generating NEAR account details:', error);
    return NextResponse.json({ error: 'Failed to generate NEAR account details' }, { status: 500 });
  }
}
