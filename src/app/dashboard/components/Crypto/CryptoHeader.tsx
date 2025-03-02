import React from "react";
import { Box, Typography, ToggleButtonGroup, ToggleButton, Paper, Grid, Avatar } from "@mui/material";

const TIME_PERIODS = [
  { label: "24H", value: "1" },
  { label: "7D", value: "7" },
  { label: "30D", value: "30" },
  { label: "1Y", value: "365" },
];

const CryptoHeader = ({
  coinName,
  coinImage,
  currentPrice,
  selectedPeriod,
  handlePeriodChange,
}: {
  coinName: string;
  coinImage: string;
  currentPrice: number;
  selectedPeriod: string;
  handlePeriodChange: (event: React.MouseEvent<HTMLElement>, newPeriod: string) => void;
}) => {
  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
      <Grid container alignItems="center" spacing={2}>
        <Grid item xs={12} md={8} sx={{ display: "flex", alignItems: "center" }}>
          <Avatar src={coinImage} alt={coinName} sx={{ width: 45, height: 45, mr: 2 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>{coinName}</Typography>
            <Typography variant="h6" color="primary">${currentPrice?.toLocaleString()}</Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={4} sx={{ display: "flex", justifyContent: "flex-end" }}>
          <ToggleButtonGroup value={selectedPeriod} exclusive onChange={handlePeriodChange}>
            {TIME_PERIODS.map((period) => (
              <ToggleButton key={period.value} value={period.value}>
                {period.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CryptoHeader;
