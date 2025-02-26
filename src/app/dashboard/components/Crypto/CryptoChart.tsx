import React from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  YAxis,
  XAxis,
} from "recharts";
import { Paper, useTheme, Box, Typography } from "@mui/material";

const CryptoChart = ({ priceData }: { priceData: any[] }) => {
  const theme = useTheme();

  const formattedData = priceData.map((d) => ({
    timestamp: new Date(d.timestamp).getTime(), // ✅ Ensure valid timestamp
    price: d.price,
  }));

  const prices = formattedData.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const buffer = (maxPrice - minPrice) * 0.1;
  const yMin = minPrice - buffer;
  const yMax = maxPrice + buffer;

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, width: "100%", height: 500, mb: 1 }}>
      <Box textAlign="center" mb={2}>
        <Typography variant="h5" >Price Trend</Typography>
      </Box>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart data={formattedData} margin={{ top: 20, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />

          <XAxis
            dataKey="timestamp"
            stroke={theme.palette.text.secondary}
            tick={{ fill: theme.palette.text.secondary }}
            tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()} 
            type="number"
            domain={["dataMin", "dataMax"]}
            tickCount={8} 
            allowDuplicatedCategory={false} 
          />

          <YAxis domain={[yMin, yMax]} hide />

          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: theme.shape.borderRadius,
            }}
            labelFormatter={(label) => new Date(label).toLocaleString()} // ✅ Show full datetime
            formatter={(value: any) => [`$${Number(value).toLocaleString()}`, "Price"]}
          />

          {/* ✅ Light glow effect below the line */}
          <defs>
            <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.4} />
              <stop offset="80%" stopColor={theme.palette.primary.main} stopOpacity={0.1} />
              <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0} />
            </linearGradient>
          </defs>

          <Area
            type="monotone"
            dataKey="price"
            stroke={theme.palette.primary.main}
            strokeWidth={3}
            fill="url(#glow)"
            dot={false}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default CryptoChart;
