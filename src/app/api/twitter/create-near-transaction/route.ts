import { NextResponse } from 'next/server';
import { parseNearAmount } from 'near-api-js/lib/utils/format';
import { PLUGIN_URL } from '@/app/config';
import { transactions } from 'near-api-js';
export const FT_TRANSFER_GAS = `50${"0".repeat(12)}`

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const receiverId = searchParams.get('receiverId');
    const accountId = searchParams.get('accountId');
    const amount = searchParams.get('amount');

    if (!receiverId || !amount) {
      return NextResponse.json({ error: 'receiverId and amount are required parameters' }, { status: 400 });
    }

    // Convert amount to yoctoNEAR (1 NEAR = 10^24 yoctoNEAR)
    const amountInYoctoNEAR = parseNearAmount(amount);

    if (!amountInYoctoNEAR) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // const transactionPayload = {
    //   signerId: accountId,
    //   actions: [
    //     {
    //       type: 'functionCall',
    //       methodName: 'ft_transfer',
    //       params: {
    //         receiverId: receiverId,
    //         deposit: amountInYoctoNEAR,
    //       },
    //     },
    //   ],
    // };

    const transactionPayload = [
      {
        signerId: accountId,
        receiverId: receiverId,
        actions: [{
          type: "FunctionCall",
          params: {
            methodName: "ft_transfer",
            args: {
              receiver_id: receiverId,
              amount: amount.toString(),
              msg: "",
            },
            // gas: 2220000000000000,
            deposit: 1,
          },
        }],
      }
    ];

    const link = `https://wallet.bitte.ai/sign-transaction?transactions_data=${encodeURIComponent(JSON.stringify(transactionPayload))}&callbackUrl=${PLUGIN_URL}/status/succeess`;

    return NextResponse.json({ link });
  } catch (error) {
    console.error('Error generating NEAR transaction payload:', error);
    return NextResponse.json({ error: 'Failed to generate NEAR transaction payload' }, { status: 500 });
  }
}
