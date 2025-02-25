import { NextResponse } from 'next/server';
import { ensurePublicKeyRegistered, pollIntentStatus, publishIntent } from "@/app/near-intent/actions/crossChainSwap";
import bs58 from 'bs58';
import { utils } from 'near-api-js';

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

    // for some reason nonce comes as double base64 encoded, decode it once
    const nonceStr = nonce;
    // const nonceStr = Buffer.from(nonce, "base64").toString();

    await ensurePublicKeyRegistered(publicKey);
    
    // const prefix = "ed25519:";
    // const cleaned = publicKey.startsWith(prefix) ? publicKey.slice(prefix.length) : publicKey;
    const signatureBuffer = bs58.encode(Buffer.from(signature, "base64"));
    // const publicKeyBuffer = bs58.encode(Buffer.from(cleaned, "base64"));
    // const messageStr = decodeURIComponent(JSON.stringify(messageString));

    const msg = JSON.parse(decodeURIComponent(messageString));
    console.log(msg);
    const messageStr = JSON.stringify(msg);

    console.log(messageStr);
    // const signatureBuffer = utils.serialize.base_encode(signature)

    // Publish intent
    const intent = await publishIntent({
        quote_hashes: [], // Empty for withdrawals
        signed_data: {
            payload: {
                message: messageStr,
                nonce: nonceStr,
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

  } catch (error) {
    console.error('Error generating NEAR account details:', error);
    return NextResponse.json({ error: 'Failed to generate NEAR account details' }, { status: 500 });
  }
}