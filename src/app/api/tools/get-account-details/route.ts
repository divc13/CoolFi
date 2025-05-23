import { NextRequest } from "next/server";
import axios, { all } from "axios";
import tokensData from "@/app/near-intent/config/tokens.json"; // Import tokens.json directly
import {connect} from "near-api-js";
import { getDepositedBalances } from "@/app/near-intent/utils/deposit";
import { settings } from "@/app/config";
import { convertAmountToDecimals, getAllSupportedTokens, getTokenByDefuseId, getTokenBySymbol, SingleChainToken, UnifiedToken } from "./token";
import { Bitcoin } from '@/app/services/bitcoin'
import { ZCash } from "@/app/services/zcash";

function convertBigIntToString(jsonArray:any) {
    return JSON.parse(JSON.stringify(jsonArray, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
    ));
}

async function get_btc_balance(accountId: string) {
    
    const path = "bitcoin-1";

    const BTC = new Bitcoin("mainnet");
    const { address, publicKey } = await BTC.deriveAddress(
      accountId,
      path
    );

    console.log("Address: ", address);
    console.log("Public Key: ", publicKey);

    const balance = await BTC.getBalance({ address });

    return balance;

}

async function get_zec_balance(accountId: string) {
    
    const path = "";

    const ZEC = new ZCash("mainnet");
    const { address, publicKey } = await ZEC.deriveAddress(
      accountId,
      path
    );

    console.log("Address: ", address);
    console.log("Public Key: ", publicKey);

    const balance = await ZEC.getBalance({ address });

    return balance;

}


async function get_token_data(accountId: string) {


    try {
      // Fetch tokens (excluding NEAR)
      const tokenResponse = await axios.get(`https://api.fastnear.com/v1/account/${accountId}/ft`);
      // Fetch NEAR balance
      const nearResponse = await axios.get(`https://api.nearblocks.io/v1/account/${accountId}`);
  
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
  
      return tokensWithUSD;
    } catch (error) {
      console.error("Error fetching balances:", error);
      return Response.json({ error: "Internal server error" }, { status: 500 });
    }
  }


  async function get_defuse_balance(accountId: string) {
    
    const nearConnection = await connect({
        networkId: "mainnet",
        nodeUrl: settings.nodeUrl,
    });

    const token_names = getAllSupportedTokens();
    const all_tokens: any[] = token_names.map((token) => {
        return getTokenBySymbol(token);
    });
    
    var tokenBalancesDefuse = await getDepositedBalances(accountId, all_tokens, nearConnection.connection.provider, "near");
    tokenBalancesDefuse = convertBigIntToString(tokenBalancesDefuse);

    const formattedTokens: any[] = [];

    for (const contractId in tokenBalancesDefuse) {
        const token_in_defuse = getTokenByDefuseId(contractId);
        if (!token_in_defuse || !tokenBalancesDefuse[contractId]) {
            continue;
        }
        const balance = (Number(tokenBalancesDefuse[contractId] )/ 10 ** token_in_defuse.decimals);
        if (balance && balance > 0 && token_in_defuse) {
            const tk_info = {
                balance: balance,
                name: token_in_defuse?.name || "Unknown Token",
                symbol: token_in_defuse?.symbol || "UNKNOWN",
                icon: token_in_defuse?.icon || "",
                decimals: token_in_defuse?.decimals || 18,
                cgId: token_in_defuse?.cgId || "",
            }
            formattedTokens.push(tk_info);
        }
    }
    return convertBigIntToString(formattedTokens);
  }


// Fetch token prices from CoinGecko
async function getTokenPrices(tokenIds: string[]) {
    
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price`,
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
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get("accountId");

  if (!accountId) {
    return Response.json({ error: "Missing accountId parameter" }, { status: 400 });
  }

  try {
    const zec_balance = await get_zec_balance(accountId);
    const btc_balance = await get_btc_balance(accountId);
    const token_balances = await get_token_data(accountId);
    const defuse_balances = await get_defuse_balance(accountId);

    console.log("ZEC Balance: ", zec_balance);
    console.log("BTC Balance: ", btc_balance);
    console.log("Token Balances: ", token_balances);
    console.log("Defuse Balances: ", defuse_balances);

    return Response.json({token_balance_wallet: token_balances, satoshi: btc_balance, zec: zec_balance / 100000000, token_balance_defuse: defuse_balances},  { status: 200 });
  } 
  catch (error) {
    console.error("Error fetching balances:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
