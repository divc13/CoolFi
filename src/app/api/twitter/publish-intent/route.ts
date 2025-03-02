import { NextResponse } from 'next/server';
import { ensurePublicKeyRegistered, pollIntentStatus, publishIntent } from "@/app/near-intent/actions/crossChainSwap";
import bs58 from 'bs58';
import { PLUGIN_URL } from '@/app/config';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    console.log(searchParams);

    const signature = searchParams.get('signature');
    const accountId = searchParams.get('accountId');
    const publicKey = searchParams.get('publicKey');
    const data = searchParams.get('data');
    if (!data) {
      console.log('Missing parameters:', { data });
      return NextResponse.json({ error: 'data is missing' }, { status: 400 });
    }
    const json_data = JSON.parse((data));
    // const json_data = JSON.parse(decodeURIComponent(data));
    const messageString = json_data.messageString;
    const recipient = json_data.recipient;
    const nonce = json_data.nonce;
    const quote_hash = json_data.quote_hash;
    const callback_url = json_data.callback_url;

    if (!signature || !publicKey || !messageString || !recipient || !nonce || !accountId) {
      console.log('Missing parameters:', { signature, publicKey, messageString, recipient, nonce });
      console.log('Nonce length:', nonce);
      return NextResponse.json({ error: 'some required parameters are missing' }, { status: 400 });
    }

    const nonceStr = encodeURIComponent(nonce);
    json_data.nonce = nonceStr;
    if (callback_url) json_data.callback_url = encodeURIComponent(callback_url);
    const cb_url = `${PLUGIN_URL}/twitter/publish-intent?data=${(JSON.stringify(json_data))}`;

    console.log('Received parameters:', { signature, publicKey, messageString, recipient, nonce }, nonce.length);

    await ensurePublicKeyRegistered(publicKey, accountId);
    const signatureBuffer = bs58.encode(Buffer.from(signature, "base64"));

    const messageStr = JSON.stringify(messageString);

    console.log(messageStr);
    console.log(messageString);

    (async () => {
        console.log("Before delay");
        await new Promise(resolve => setTimeout(resolve, 4000));
        console.log("After 1 second delay");
    })();

    // Publish intent
    const intent = await publishIntent({
        quote_hashes: !quote_hash ? [] : [quote_hash],
        signed_data: {
            payload: {
                message: messageStr,
                nonce: nonce,
                recipient,
                callbackUrl: cb_url,
            },
            standard: "nep413",
            signature: `ed25519:${signatureBuffer}`,
            public_key: `${publicKey}`
        }
    });
    
    console.log('Intent:', intent);

    if (intent.status === "OK") {
        const finalStatus = await pollIntentStatus(intent.intent_hash);
        return NextResponse.json({finalStatus , callback_url: callback_url}, {status: 200});
    }
    return NextResponse.json({intent}, {status: 400});

    // return NextResponse.json({status: 200});

  } catch (error) {
    console.error('Error generating NEAR account details:', error);
    return NextResponse.json({ error: 'Failed to generate NEAR account details' }, { status: 500 });
  }
}