import { NextRequest, NextResponse } from 'next/server';
import { predictions } from '@/app/services/predictions';
import { PLUGIN_URL } from '@/app/config';

interface TokenBalance {
  contractId?: string;
  balance: number;
  name: string;
  symbol: string;
  icon: string;
  decimals: number;
  cgId: string;
  amountUSD?: number;
}

interface AccountDetails {
  token_balance_wallet: TokenBalance[];
  satoshi: number;
  token_balance_defuse: TokenBalance[];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");
    
    if (!accountId) {
      return NextResponse.json({ error: "Missing accountId parameter" }, { status: 400 });
    }
    
    // Get account details from your API
    const response = await fetch(`${PLUGIN_URL}/api/tools/get-account-details?accountId=${accountId}`);
    const accountDetails: AccountDetails = await response.json();
    
    if (!accountDetails || !accountDetails.token_balance_wallet) {
      return NextResponse.json({ error: "Failed to fetch account details" }, { status: 500 });
    }
    
    // Combine wallet and defuse balances for a comprehensive view
    let allTokens: Record<string, TokenBalance> = {};
    
    // Process wallet tokens
    accountDetails.token_balance_wallet.forEach(token => {
      token.balance = Number(token.balance)/(10**token.decimals);
      allTokens[token.symbol] = token;
    });
    
    // Add or update with defuse tokens
    accountDetails.token_balance_defuse.forEach(token => {
      if (allTokens[token.symbol]) {
        // If token exists in wallet, add balances together
        allTokens[token.symbol].balance += token.balance;
        if (allTokens[token.symbol]?.amountUSD !== undefined && token.amountUSD !== undefined) {
          allTokens[token.symbol].amountUSD = (allTokens[token.symbol].amountUSD ?? 0) + token.amountUSD;
        }        
      } else {
        // If token doesn't exist in wallet, add it
        allTokens[token.symbol] = token;
      }
    });
    
    // Add Bitcoin if present
    if (accountDetails.satoshi > 0) {
      // Convert satoshi to BTC
      const btcBalance = accountDetails.satoshi / 100000000;
      
      // Use BTC price if available in one of the tokens, otherwise estimate
      const btcPrice = allTokens["WBTC"]?.amountUSD 
        ? allTokens["WBTC"].amountUSD / allTokens["WBTC"].balance 
        : 60000; // Fallback price estimate
      
      allTokens["BTC"] = {
        balance: btcBalance,
        name: "Bitcoin",
        symbol: "BTC",
        icon: "https://s2.coinmarketcap.com/static/img/coins/128x128/1.png",
        decimals: 8,
        cgId: "bitcoin",
        amountUSD: btcBalance * btcPrice
      };
    }
    
    // Function to suggest swaps based on predictions and wallet composition
    function suggestSwaps(walletTokens: Record<string, TokenBalance>, predictions: Record<string, number[]>): any[] {
      const latestPredictions: Record<string, number> = {};
      
      // Get the latest prediction for each token
      for (const crypto in predictions) {
        if (predictions[crypto] && predictions[crypto].length > 0) {
          latestPredictions[crypto] = predictions[crypto][predictions[crypto].length - 1];
        }
      }
      
      // Filter tokens that exist in both wallet and predictions
      const relevantTokens = Object.keys(walletTokens).filter(symbol => 
        latestPredictions[symbol] !== undefined && walletTokens[symbol].balance > 0
      );
      
      if (relevantTokens.length === 0) {
        return [];
      }
      
      // Sort by prediction score (descending)
      const sortedTokens = relevantTokens.sort((a, b) => 
        latestPredictions[b] - latestPredictions[a]
      );
      
      // Calculate total portfolio value for percentage allocation
      const totalPortfolioValue = Object.values(walletTokens)
        .reduce((sum, token) => sum + (token.amountUSD || 0), 0);
      
      // Identify tokens to sell (negative prediction)
      const tokensToSell = sortedTokens
        .filter(symbol => latestPredictions[symbol] < 0)
        .map(symbol => ({
          symbol,
          value: walletTokens[symbol].amountUSD || 0,
          prediction: latestPredictions[symbol],
          percentOfPortfolio: ((walletTokens[symbol].amountUSD || 0) / totalPortfolioValue) * 100
        }));
      
      // Identify tokens to buy (positive prediction)
      const tokensToBuy = sortedTokens
        .filter(symbol => latestPredictions[symbol] > 0)
        .map(symbol => ({
          symbol,
          currentValue: walletTokens[symbol].amountUSD || 0,
          prediction: latestPredictions[symbol],
          percentOfPortfolio: ((walletTokens[symbol].amountUSD || 0) / totalPortfolioValue) * 100
        }))
        .sort((a, b) => b.prediction - a.prediction); // Sort by highest prediction score
      
      // Generate swap recommendations
      const recommendations:any = [];
      
      // Calculate total value to reallocate
      const totalValueToReallocate = tokensToSell.reduce((sum, token) => sum + token.value, 0);
      
      if (totalValueToReallocate > 0 && tokensToBuy.length > 0) {
        // For each token to buy, allocate proportional to its prediction score
        const totalBuyScore = tokensToBuy.reduce((sum, token) => sum + token.prediction, 0);
        
        tokensToBuy.forEach(buyToken => {
          // Allocation proportion based on prediction score
          const allocationProportion = buyToken.prediction / totalBuyScore;
          const valueToAllocate = totalValueToReallocate * allocationProportion;
          
          // For each sell token, create a recommendation
          tokensToSell.forEach(sellToken => {
            // Calculate proportion of this sell token's value to the total value being reallocated
            const sellProportion = sellToken.value / totalValueToReallocate;
            const valueFromThisSellToken = sellToken.value * sellProportion;
            
            if (valueFromThisSellToken > 1) { // Only suggest swaps worth more than $1
              recommendations.push({
                action: "swap",
                from: {
                  symbol: sellToken.symbol,
                  valueUSD: valueFromThisSellToken.toFixed(2),
                  prediction: sellToken.prediction.toFixed(2)
                },
                to: {
                  symbol: buyToken.symbol,
                  valueUSD: valueFromThisSellToken.toFixed(2),
                  prediction: buyToken.prediction.toFixed(2)
                },
                reasoning: `${sellToken.symbol} has negative outlook (${sellToken.prediction.toFixed(2)}), while ${buyToken.symbol} shows positive trend (${buyToken.prediction.toFixed(2)})`
              });
            }
          });
        });
      }
      
      return recommendations;
    }
    
    const swapRecommendations = suggestSwaps(allTokens, predictions);
    
    if (swapRecommendations.length === 0) {
      return NextResponse.json({ 
        message: "No swap recommendations available at this time.",
        wallet_summary: Object.values(allTokens).map(token => ({
          symbol: token.symbol,
          balance: token.balance,
          valueUSD: token.amountUSD
        }))
      });
    }
    
    return NextResponse.json({ 
      recommendations: swapRecommendations,
      wallet_summary: Object.values(allTokens).map(token => ({
        symbol: token.symbol,
        balance: token.balance,
        valueUSD: token.amountUSD
      }))
    });
    
  } catch (error) {
    console.error("Error generating swap recommendations:", error);
    return NextResponse.json({ error: "Failed to generate swap recommendations" }, { status: 500 });
  }
}