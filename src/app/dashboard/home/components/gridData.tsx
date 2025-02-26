import Avatar from '@mui/material/Avatar';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import axios from 'axios';
import tokensJson from '@/app/near-intent/config/tokens.json';

// ✅ Extract CoinGecko IDs from tokens.json
const tokens = [
  ...tokensJson.tokens.mainnet.unified_tokens,
  ...tokensJson.tokens.mainnet.single_chain_tokens
];

const CRYPTO_IDS = tokens.map(token => token.cgId).filter(id => id); // Extract CoinGecko IDs

// ✅ Fetch Crypto Data with Retry Logic (Max 3 Attempts)
const fetchCryptoData = async (maxRetries = 3, retryDelay = 2000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Fetching crypto data (Attempt ${attempt})...`);

      const response = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
        params: {
          vs_currency: "usd",
          ids: CRYPTO_IDS.join(","), // Fetch only specified cryptos
          sparkline: true, // Include 7-day price trend data
        },
      });

      console.log("✅ Crypto data fetched successfully!");
      return response.data; // Return successful response
    } catch (error) {
      console.error(`⚠️ Error fetching crypto data (Attempt ${attempt}):`, error);

      if (attempt < maxRetries) {
        console.log(`⏳ Retrying in ${retryDelay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay)); // Wait before retrying
        retryDelay *= 2; // Exponential backoff (doubles delay each retry)
      } else {
        console.error("❌ All retry attempts failed. Returning fallback data...");
        return []; // Return empty array if all attempts fail
      }
    }
  }
};

// ✅ Render Sparkline Chart in Table Cell
function renderSparklineCell(params: any) {
  const priceTrend = params.value || [];

  if (!priceTrend.length) {
    return <span style={{ color: 'gray' }}>N/A</span>;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <SparkLineChart
        data={priceTrend}
        width={200}
        height={64}
        plotType="line"
        showHighlight
        showTooltip
        colors={['hsl(210, 98%, 42%)']}
      />
    </div>
  );
}

// ✅ Render Crypto Avatar
function renderCryptoAvatar(params: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <Avatar
        src={params.row.image}
        alt={params.row.name}
        sx={{ width: 32, height: 32 }}
      />
    </div>
  );
}

// ✅ Table Columns Definition
export const columns: GridColDef[] = [
  {
    field: 'symbol',
    headerName: 'Symbol',
    flex: 1,
    minWidth: 70,
    align: 'center',
    headerAlign: 'center',
    renderCell: renderCryptoAvatar,
  },
  { 
    field: 'name', 
    headerName: 'Name', 
    flex: 1, 
    minWidth: 150,
    align: 'center',
    headerAlign: 'center'
  },
  {
    field: 'current_price',
    headerName: 'Price (USD)',
    flex: 1,
    minWidth: 100,
    align: 'center',
    headerAlign: 'center',
    valueFormatter: (params:any) =>
      params ? `$${params.toLocaleString()}` : 'N/A',
  },
  {
    field: 'market_cap',
    headerName: 'Market Cap',
    flex: 1.5,
    minWidth: 150,
    align: 'center',
    headerAlign: 'center',
    valueFormatter: (params:any) =>
      params ? `$${params.toLocaleString()}` : 'N/A',
  },
  {
    field: 'total_volume',
    headerName: '24h Volume',
    flex: 1.5,
    minWidth: 150,
    align: 'center',
    headerAlign: 'center',
    valueFormatter: (params:any) =>
      params ? `$${params.toLocaleString()}` : 'N/A',
  },
  {
    field: 'price_change_percentage_24h',
    headerName: '24h Change (%)',
    flex: 1,
    minWidth: 150,
    align: 'center',
    headerAlign: 'center',
    valueFormatter: (params:any) =>
      params !== undefined ? `${params.toFixed(2)}%` : 'N/A',
  },
  {
    field: 'circulating_supply',
    headerName: 'Circulating Supply',
    flex: 1.5,
    minWidth: 160,
    align: 'center',
    headerAlign: 'center',
    valueFormatter: (params:any) =>
      params ? `${params.toLocaleString()}` : 'N/A',
  },
//   {
//     field: 'max_supply',
//     headerName: 'Max Supply',
//     flex: 1.5,
//     minWidth: 150,
//     align: 'center',
//     headerAlign: 'center',
//     valueFormatter: (params) =>
//       params ? `${params.toLocaleString()}` : 'N/A',
//   },
  {
    field: 'sparkline',
    headerName: 'Price Trend (7d)',
    flex: 1.5,
    minWidth: 175,
    align: 'center',
    headerAlign: 'center',
    renderCell: renderSparklineCell,
  },
];


export async function loadCryptoRows() {
  const cryptoData = await fetchCryptoData(); // Fetch with retry logic

  const processedRows = cryptoData.map((coin: any) => {
    // Match fetched data with tokens.json for icons
    const tokenData = tokens.find(t => t.cgId === coin.id);

    return {
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: tokenData?.icon || coin.image, // Use token.json icon if available
      current_price: coin.current_price ?? 0,
      market_cap: coin.market_cap ?? 0,
      total_volume: coin.total_volume ?? 0,
      price_change_percentage_24h: coin.price_change_percentage_24h ?? 0,
      circulating_supply: coin.circulating_supply ?? 0,
      max_supply: coin.max_supply ?? 0,
      sparkline: coin.sparkline_in_7d?.price?.length ? coin.sparkline_in_7d.price : [],
    };
  });

  return processedRows;
}
