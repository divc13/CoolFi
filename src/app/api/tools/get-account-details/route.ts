import { NextResponse } from 'next/server';
import { WalletProvider } from "../../../near-intent/providers/wallet"
import { Bitcoin } from '../../../services/bitcoin'
import bs58 from 'bs58';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    if (!accountId) {
      return NextResponse.json({ error: 'accountId are required parameters' }, { status: 400 });
    }

    // const path = debounce("bitcoin-1", 500);
    console.log("path: ", path);
    const path = "bitcoin-1";

    const BTC = new Bitcoin("testnet");
    const { address, publicKey } = await BTC.deriveAddress(
      "law1912.testnet",
      path
    );

    console.log("Address: ", address);
    console.log("Public Key: ", publicKey);

    const balance = await BTC.getBalance({ address });


    const walletProvider = new WalletProvider(accountId);
    const accountDetails = await walletProvider.get();
    
    return NextResponse.json({accountDetails : accountDetails, satoshi: balance}, { status: 200 });
  } catch (error) {
    console.error('Error generating NEAR account details:', error);
    return NextResponse.json({ error: 'Failed to generate NEAR account details' }, { status: 500 });
  }
}
