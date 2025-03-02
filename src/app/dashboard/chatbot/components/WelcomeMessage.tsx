"use client";

import { useTheme } from "@mui/material/styles";
import { Box, Typography, Divider, Grid, Card, CardContent } from "@mui/material";
import Image from "next/image";

const suggestions = [
  {
    title: "Seamless Cross-Chain Swaps",
    description: "Effortlessly swap assets across multiple blockchains with NEAR Intents.",
  },
  {
    title: "Optimized Insights for Swapping",
    description: "Receive AI-driven recommendations for maximizing your swap profits.",
  },
  {
    title: "Bitcoin Deposits and Withdraw",
    description: "Deposit Bitcoin easily and securely with our trusted platform.",
  },
];

const WelcomeMessage: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <Box
    sx={{
        bgcolor: isDarkMode ? "#0A0A0A" : "background.paper",
        color: isDarkMode ? "#E0E0E0" : "#333333",
        textAlign: "center",
        p: 4,    
        transform: "translate(-10%, 0%)",
        borderRadius: 4,
        width: "120%", 
        mt: 1,
        boxShadow: isDarkMode
          ? "0px 4px 12px rgba(255, 255, 255, 0.1)"
          : "0px 4px 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Centered Logo */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <Image src="/coolfi.png" alt="CoolFi" width={120} height={120} />
      </Box>

      {/* Title */}
      <Typography variant="h4" fontWeight="600">
        CoolFi Assistant
      </Typography>

        <Typography variant="h6" color="gray">Welcome! How can I assist you today?</Typography>


      {/* Divider */}
      <Divider
        sx={{
            my: 4,
            width: "50%",
            mx: "auto",
            bgcolor: isDarkMode ? "#505865" : "#CCCCCC",
        }}
        />

      <Grid container spacing={3} justifyContent="center" overflow="hidden">
        {suggestions.map((suggestion, index) => (
          <Grid item xs={12} sm={4} key={index}>
           <Card
            sx={{
                bgcolor: isDarkMode ? "#1E1E1E" : "#FFFFFF",
                color: isDarkMode ? "#E0E0E0" : "#333333",
                boxShadow: isDarkMode
                ? "0px 4px 10px rgba(255, 255, 255, 0.08)"
                : "0px 4px 10px rgba(0, 0, 0, 0.08)",
                borderRadius: 3,
                textAlign: "center",
                p: 2,
                transform: "translate(0%, 0%)",
                width: "100%",
                // height: 220, // Fixed height for all cards
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between", // Ensures proper spacing
                overflow: "hidden"
            }}
            >
            <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Typography variant="h6" fontWeight="600">
                {suggestion.title}
                </Typography>
            </CardContent>
            </Card>

          </Grid>
        ))}
      </Grid>
        </Box>
  );
};

export default WelcomeMessage;
