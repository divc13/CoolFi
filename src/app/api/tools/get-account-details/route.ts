import { NextResponse } from 'next/server';
import { WalletProvider } from "../../../near-intent/providers/wallet"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json({ error: 'accountId are required parameters' }, { status: 400 });
    }

    const walletProvider = new WalletProvider(accountId);
    const accountDetails = await walletProvider.get();
    
    return NextResponse.json({accountDetails : accountDetails});
  } catch (error) {
    console.error('Error generating NEAR account details:', error);
    return NextResponse.json({ error: 'Failed to generate NEAR account details' }, { status: 500 });
  }
}
