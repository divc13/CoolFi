import React from "react";
import { Grid, Card, CardContent, Typography, Box, Paper } from "@mui/material";

const CryptoStats = ({
  marketCap,
  volume,
  priceChange,
  circulatingSupply,
  maxSupply,
  allTimeHigh,
}: {
  marketCap: number;
  volume: number;
  priceChange: number;
  circulatingSupply: number;
  maxSupply: number | string;
  allTimeHigh: number;
}) => {
  const isPriceUp = priceChange >= 0;

  return (
    <Box display="flex" justifyContent="center" width="100%">
    <Grid container spacing={2}>
      {[
        { label: "Market Cap", value: `$${marketCap.toLocaleString()}` },
        { label: "24h Volume", value: `$${volume.toLocaleString()}` },
        { label: "Price Change (24h)", value: `${isPriceUp ? "+" : ""}${priceChange.toFixed(2)}%` },
        { label: "Circulating Supply", value: circulatingSupply.toLocaleString() },
        { label: "Max Supply", value: maxSupply },
        { label: "All-Time High", value: `$${allTimeHigh.toLocaleString()}` },
      ].map((metric, index) => (
        <Grid item xs={12} sm={4} key={index}> {/* ✅ 3 per row */}
          <Paper elevation={3} sx={{ minWidth: 120, minHeight: 110, display: "flex", alignItems: "center", justifyContent: "center" }}> 
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="subtitle2">{metric.label}</Typography>
              <Typography variant="h6">{metric.value}</Typography>
            </CardContent>
          </Paper>
        </Grid>
      ))}
    </Grid>
    </Box>
  );
};

export default CryptoStats;
