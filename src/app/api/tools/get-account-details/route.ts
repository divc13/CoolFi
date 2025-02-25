import { NextResponse } from 'next/server';
import { Bitcoin } from '@/app/services/bitcoin'
import { headers } from 'next/headers';
import axios from "axios";
import tokensData from "@/app/near-intent/config/tokens.json"; // Import tokens.json directly
import { settings } from '@/app/config';


async function getTokenPrices(tokenIds: string[]) {
  try {
    const response = await axios.get(
      `${settings.coingeckoUrl}/simple/price`,
      {
        params: {
          ids: tokenIds.join(","),
          vs_currencies: "usd",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching token prices:", error);
    return {};
  }
}

// Handle GET requests
export async function get_token_data(accountId: string) {

  if (!accountId) {
    return Response.json({ error: "Missing accountId parameter" }, { status: 400 });
  }

  try {
    // Fetch tokens (excluding NEAR)
    const tokenResponse = await axios.get(`https://api.fastnear.com/v1/account/${accountId}/ft`);
    console.log(tokenResponse.data);
    // Fetch NEAR balance
    const nearResponse = await axios.get(`https://api.nearblocks.io/v1/account/${accountId}`);
    console.log(nearResponse.data);

    const tokens = tokenResponse.data.tokens || [];
    const nearBalance = nearResponse.data.account[0]?.amount || "0";

    // Process token balances
    const tokenBalances = tokens.map((token: any) => {
      const tokenInfo =
        tokensData.tokens.mainnet.unified_tokens.find(
          (t: any) =>
            Object.values(t.addresses).some(
              (addr: any) => addr.address === token.contract_id
            )
        ) ||
        tokensData.tokens.mainnet.single_chain_tokens.find(
          (t: any) => t.defuseAssetId === `nep141:${token.contract_id}`
        );

      return {
        contractId: token.contract_id,
        balance: token.balance,
        name: tokenInfo?.name || "Unknown Token",
        symbol: tokenInfo?.symbol || "UNKNOWN",
        icon: tokenInfo?.icon || "",
        decimals: tokenInfo?.decimals || 18,
        cgId: tokenInfo?.cgId || "",
      };
    });

    // Add NEAR token
    tokenBalances.push({
      contractId: "wrap.near",
      balance: nearBalance,
      name: "NEAR",
      symbol: "NEAR",
      icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/11808.png",
      decimals: 24,
      cgId: "near",
    });

    // Fetch USD prices
    const tokenPrices = await getTokenPrices(
      tokenBalances.map((t:any) => t.cgId).filter(Boolean)
    );

    // Convert balances to USD and filter out tokens with 0 USDC balance
    const tokensWithUSD = tokenBalances
      .map((t: any) => ({
        ...t,
        amountUSD:
          (parseFloat(t.balance) / 10 ** t.decimals) * (tokenPrices[t.cgId]?.usd || 0),
      }))
      .filter((t: any) => t.amountUSD > 0); // Remove tokens with 0 USD balance
      console.log("tokensWithUSD", tokensWithUSD);

    return tokensWithUSD;
  } catch (error) {
    console.error("Error fetching balances:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    if (!accountId) {
      return NextResponse.json({ error: 'accountId are required parameters' }, { status: 400 });
    }

    // const path = debounce("bitcoin-1", 500);
    const path = "bitcoin-1";

    const BTC = new Bitcoin("mainnet");
    const { address, publicKey } = await BTC.deriveAddress(
      accountId,
      path
    );

    console.log("Address: ", address);
    console.log("Public Key: ", publicKey);

    const balance = await BTC.getBalance({ address });
    const accountDetails = await get_token_data(accountId);
    console.log("Account Details: ", accountDetails);
    return NextResponse.json({accountDetails : accountDetails, satoshi: balance}, { status: 200 });
  } catch (error) {
    console.error('Error generating NEAR account details:', error);
    return NextResponse.json({ error: 'Failed to generate NEAR account details' }, { status: 500 });
  }
}
