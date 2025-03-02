"use client";

import { BitteAiChat } from "@bitte-ai/chat";
import "@bitte-ai/chat/style.css";
import { useBitteWallet, Wallet } from "@bitte-ai/react";
import { useEffect, useState } from "react";
import WelcomeMessage from "./WelcomeMessage";
import { Container, Paper, Box, useTheme, Typography } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";

const bitteAgent = {
  id: "coolfi-ai.vercel.app",
  name: "CoolFi AI",
  description: "CoolFi Assistant enables seamless cross-chain swaps using NEAR Intents, accepts Bitcoin deposits, and facilitates BTC swaps via NEAR Intents. Additionally, it analyzes user accounts and provides data-driven recommendations on optimal currency swaps to maximize profit.",
  verified: true,
  image: "/coolfi.png",
};

const Main: React.FC = () => {
  const { selector } = useBitteWallet();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  useEffect(() => {
    const fetchWallet = async () => {
      if (selector) {
        const walletInstance = await selector.wallet();
        setWallet(walletInstance);
      }
    };
    fetchWallet();
  }, [selector]);

  return (
    <Container maxWidth="lg" sx={{ my: 1, display: "flex", justifyContent: "center" }}>
      <Paper
        elevation={6}
        sx={{
          p: 3,
          width: "85%",
          maxWidth: "1200px",
          bgcolor:  isDarkMode ? "#010205" : "#FFFFFF",
          color: isDarkMode ? "#010205" : "#000000",
          borderRadius: 2,
            boxShadow: isDarkMode ?"0px 0px 40px rgba(255, 255, 255, 0.5)":  "0px 0px 20px rgba(0, 0, 0, 0.5)", 
        }}
      >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <ChatIcon sx={{ fontSize: 32, mr: 1, color: "primary.main" }} />
            <Typography 
                variant="h5" 
                fontWeight="bold" 
                sx={{ color: isDarkMode ? "grey.300" : "grey.900" }}
            >
                Chat With CoolFi
            </Typography>
            </Box>


        <Box sx={{ height: { xs: "calc(100vh - 120px)", md: "calc(100vh - 190px)" } }}>


            <BitteAiChat
              agentId={bitteAgent.id}
              // @ts-expect-error: Wallet is not null
              wallet={{ near: { wallet } }}
              apiUrl="/api/chat"
              historyApiUrl="/api/chat-history"
              options={{
                agentImage: bitteAgent.image,
                agentName: bitteAgent.name,
                colors: {
                  generalBackground: isDarkMode ? "#000000" : "background.paper",
                  messageBackground: isDarkMode ? "#0A0A0A" : "#EEEEEE",
                  textColor: isDarkMode ? "#FAFAFA" : "#000000",
                  buttonColor: isDarkMode ? "#000000" : "#999999",
                  borderColor: isDarkMode ? "#444444" : "#D1D5DB",
                },
                welcomeMessageComponent: <WelcomeMessage />,
              }}
            />
        </Box>
      </Paper>
    </Container>
  );
};

export default Main;
