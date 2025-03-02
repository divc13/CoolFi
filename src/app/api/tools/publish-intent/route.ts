import { NextResponse } from 'next/server';
import { ensurePublicKeyRegistered, pollIntentStatus, publishIntent } from "@/app/near-intent/actions/crossChainSwap";
import bs58 from 'bs58';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const signature = searchParams.get('signature');
    const accountId = searchParams.get('accountId');
    // const publicKey = "ed25519:JAZBD6Cym9db9zWjPv6cowibfxaNzYFkKPXJL8KvKebi";
    const publicKey = searchParams.get('publicKey');
    const messageString = searchParams.get('message');
    const recipient = searchParams.get('receiverId');
    const nonce = searchParams.get('nonce');
    const quote_hash = searchParams.get('quote_hash');
    const call_back_url = searchParams.get('callback_url');

    console.log(call_back_url);

    if (!signature || !publicKey || !messageString || !recipient || !nonce || !accountId) {
      console.log('Missing parameters:', { signature, publicKey, messageString, recipient, nonce });
      console.log('Nonce length:', nonce);
      return NextResponse.json({ error: 'some required parameters are missing' }, { status: 400 });
    }

    console.log('Received parameters:', { signature, publicKey, messageString, recipient, nonce }, nonce.length);

    const nonceStr = nonce;
    await ensurePublicKeyRegistered(publicKey, accountId);
    const signatureBuffer = bs58.encode(Buffer.from(signature, "base64"));

    const msg = JSON.parse(decodeURIComponent(messageString));
    console.log(msg);
    const messageStr = JSON.stringify(msg);

    console.log(messageStr);


    // Publish intent
    const intent = await publishIntent({
        quote_hashes: !quote_hash ? [] : [quote_hash],
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
        return NextResponse.json({finalStatus, callback_url: call_back_url});
    }
    return NextResponse.json(intent);

  } catch (error) {
    console.error('Error generating NEAR account details:', error);
    return NextResponse.json({ error: 'Failed to generate NEAR account details' }, { status: 500 });
  }
}