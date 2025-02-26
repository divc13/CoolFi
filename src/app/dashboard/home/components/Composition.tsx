"use client";

import React, { useEffect, useState } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { useDrawingArea } from "@mui/x-charts/hooks";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import LinearProgress, { linearProgressClasses } from "@mui/material/LinearProgress";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";
import { useBitteWallet } from "@bitte-ai/react"; // Wallet Hook
import Image from "next/image";
import "@near-wallet-selector/modal-ui/styles.css"

// ✅ Function to render text inside the Pie Chart
function PieCenterLabel({ totalValue }: { totalValue: number }) {
  const { width, height, left, top } = useDrawingArea();
  const primaryY = top + height / 2 - 10;
  const secondaryY = primaryY + 24;
  const theme = useTheme();
  const textColor = theme.palette.mode === "dark" ? "#fff" : "#000";

  return (
    <>
      <text
        x={left + width / 2}
        y={primaryY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="22"
        fontWeight="bold"
        fill={textColor}
      >
        ${totalValue.toLocaleString()} {/* ✅ Dynamic Total */}
      </text>
      <text
        x={left + width / 2}
        y={secondaryY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="14"
        fill="gray"
      >
        Total
      </text>
    </>
  );
}

// ✅ Main Composition Component
export default function Composition() {
  const { isConnected, connect, activeAccountId } = useBitteWallet(); // Wallet Hook
  const [fundData, setFundData] = useState<any>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  // ✅ Fetch balance from API if wallet is connected
  useEffect(() => {
    if (!isConnected || !activeAccountId) return;

    setLoading(true);
    fetch(`/api/getBalance?accountId=${activeAccountId}`)
      .then((res) => res.json())
      .then((data) => {
        const total = data.reduce((sum, item) => sum + item.amountUSD, 0);
        const sortedData = [...data].sort((a, b) => b.amountUSD - a.amountUSD).slice(0, 5);

        setFundData(
          data.map((token) => ({
            label: token.symbol.toUpperCase(),
            value: (token.amountUSD),
            amount: (parseFloat(token.balance) / 10 ** token.decimals),
            cgId: token.cgId,
            icon: token.icon,
          }))
        );
        setTotalValue(total);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching balance:", err);
        setLoading(false);
      });
  }, [isConnected, activeAccountId]);

  // ✅ If not connected, show "Connect Wallet" prompt
  if (!isConnected) {
    return (

    <Card 
  variant="outlined" 
  sx={{ 
    display: "flex", 
    flexDirection: "column", 
    alignItems: "center",  // ✅ Centers content horizontally
    justifyContent: "center",  // ✅ Centers content vertically
    flexGrow: 1, 
    gap:0,
    p: 5, 
    minHeight: "100%",  // ✅ Ensures expansion in case height is undefined
    width: "100%", // ✅ Prevents shrinkage
    textAlign: "center", // ✅ Ensures text is always centered
    bgcolor: isDarkMode ? "#010101" : "#f9f9f9",
  }}
>
    <Box sx={{mt:2}}>
    <Image src="/coolfi.png" alt="CoolFi" width={150} height={150}  />
    </Box>
      
  <Typography variant="h4" fontWeight="bold" sx={{ mb: 0, mt: 0 }}>
    Unlock AI-Powered Insights
  </Typography>
  
  <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mb: 2 }}>
    Connect your wallet to get deep insights into your portfolio.
  </Typography>
  
  <Button variant="contained" color="primary" onClick={connect} size="large">
    Connect Wallet
  </Button>
</Card>
      );
  }

  // ✅ Show loading state
  if (loading) {
    return (
      <Card variant="outlined" sx={{ mt: 5 }}>
        <Typography variant="h6">Loading...</Typography>
      </Card>
    );
  }

  // ✅ Extract top 5 assets based on USD value
  const top5Assets = fundData
    .sort((a:any, b:any) => b.value - a.value)
    .slice(0, 5)
    .map((asset:any) => ({
      name: asset.label,
      value: ((asset.value / totalValue) * 100).toFixed(2), // Convert to percentage
      flag: <Image src={asset.icon} width={32} height={32} alt={asset.label} />,
      color: "hsl(220, 25%, 65%)", // Adjust color shades if needed
    }));

  return (
    <Card variant="outlined" sx={{ display: "flex", flexDirection: "column", gap: 3, flexGrow: 1, p: 3, height: "100%", backgroundColor:"" }}>
      <CardContent>
        {/* ✅ Centered Title */}
        <Box textAlign="center" mb={3}>
          <Typography component="h2" variant="h6" gutterBottom>
            Composition of Your Wallet
          </Typography>
        </Box>

        {/* ✅ FLEX CONTAINER for Chart & Bars */}
        <Box sx={{ display: "flex", gap: 5, alignItems: "center", justifyContent: "center",flexWrap: "wrap", minWidth: 0 }}>
          {/* ✅ Pie Chart (Left) */}
          <Box sx={{ flexShrink: 0 }}>
            <PieChart
              colors={["#6D83F2", "#A084E8", "#C084FC", "#84C5F4", "#6AD4DD"]}
              margin={{ left: 80, right: 80, top: 80, bottom: 80 }}
              series={[
                {
                  data: fundData,
                  innerRadius: 75,
                  outerRadius: 100,
                  paddingAngle: 0,
                  highlightScope: { faded: "global", highlighted: "item" },
                  valueFormatter: (item, { dataIndex }) => `${fundData[dataIndex].amount}`,
                },
              ]}
              height={270}
              width={270}
              slotProps={{ 
                legend: { hidden: true },
              }}
            >
              <PieCenterLabel totalValue={totalValue} />
            </PieChart>
          </Box>

          {/* ✅ Top 5 Progress Bars (Right) */}
          <Box sx={{ flexGrow: 1, minWidth: 120 }}>
            {top5Assets.map((asset, index) => (
              <Stack key={index} direction="row" sx={{ alignItems: "center", gap: 2, pb: 2 }}>
                {asset.flag}
                <Stack sx={{ flexGrow: 1 }}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2" sx={{ fontWeight: "500" }}>
                      {asset.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      {asset.value}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={parseFloat(asset.value)}
                    sx={{
                      height: 6, // ✅ Increased bar height for better visibility
                      borderRadius: 5,
                      [`& .${linearProgressClasses.bar}`]: { backgroundColor: asset.color },
                    }}
                  />
                </Stack>
              </Stack>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
