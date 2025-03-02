import { DataGrid } from '@mui/x-data-grid';
import { columns, loadCryptoRows } from './gridData';
import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import tokensData from '@/app/near-intent/config/tokens.json';

export default function CustomizedDataGrid() {
  const [data, setData] = useState([]);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const coinGeckoIds = useMemo(() => 
    tokensData.tokens.mainnet.unified_tokens.map(token => token.cgId)
      .concat(tokensData.tokens.mainnet.single_chain_tokens.map(token => token.cgId)), 
    [tokensData]
  );
  
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const newRows = await loadCryptoRows();
        setData(newRows);
      } catch (error) {
        console.error("❌ Error fetching initial data:", error);
      } finally {
        setLoading(false);
      }
    }

    async function fetchCryptoPrices() {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoIds.join(',')}&vs_currencies=usd`
        );
        const priceData = await response.json();
        setPrices(priceData);
      } catch (error) {
        console.error("❌ Error fetching CoinGecko prices:", error);
      }
    }

    fetchInitialData();
    const intervalId = setInterval(fetchCryptoPrices, 30000);

    return () => clearInterval(intervalId);
  }, [coinGeckoIds]);

  const updatedData = data.map((row:any) => ({
    ...row,
    current_price: prices[row.symbol] ? prices[row.symbol].usd : row.current_price,
  }));

  return (
<Box sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
  {loading ? (
    <CircularProgress />
  ) : (
    <Box sx={{ width: "100%", overflowX: "auto", display: "flex" }}>
      <Box sx={{ flexShrink: 1, width: "100%", minWidth: "300px", overflowX: "scroll" }}>
       
        <DataGrid
          rows={updatedData}
          columns={columns}
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
          }
          initialState={{ pagination: { paginationModel: { pageSize: 9 } } }}
          pageSizeOptions={[9, 18, 27]}
        //   disableColumnResize
          density="comfortable"
          sx={{
            width: "100%",
            minWidth: "400px",
            maxWidth: "100%",
            overflowX: "scroll",
            cursor: "pointer",
            contain: "inline-size"
          }}
          onRowClick={(params) => {
            const coinId = params.row.id;
            router.push(`/dashboard/crypto/${coinId}`);
          }}
          slotProps={{
            filterPanel: {
              filterFormProps: {
                logicOperatorInputProps: { variant: "outlined", size: "small" },
                columnInputProps: { variant: "outlined", size: "small", sx: { mt: "auto" } },
                operatorInputProps: { variant: "outlined", size: "small", sx: { mt: "auto" } },
                valueInputProps: { InputComponentProps: { variant: "outlined", size: "small" } },
              },
            },
          }}
        />
      </Box>
    </Box>
  )}
</Box>


  );
}