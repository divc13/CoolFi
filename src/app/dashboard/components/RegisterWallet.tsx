"use client";

import React from "react";
import { Button } from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { useBitteWallet } from "@bitte-ai/react";
import "@near-wallet-selector/modal-ui/styles.css"

const RegisterWallet: React.FC = () => {
  
    const { isConnected, connect } = useBitteWallet();
  
    const handleSignIn = async () => {
      try {
        await connect();
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    };
  
    if (!isConnected) {
        return (
            <Button 
                variant="outlined" 
                onClick={handleSignIn} 
                startIcon={<AccountBalanceWalletIcon />}
            >
            Connect Wallet
            </Button>
        );
      }
      
      return null;
    };

export default RegisterWallet;
