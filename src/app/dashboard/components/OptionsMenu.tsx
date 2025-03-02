"use client";

import * as React from "react";
import IconButton from "@mui/material/IconButton";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { useBitteWallet } from "@bitte-ai/react";
import "@near-wallet-selector/modal-ui/styles.css"

export default function OptionsMenu() {
  const { selector } = useBitteWallet();

  const handleSignOut = async () => {
    const wallet = await selector.wallet();
    await wallet.signOut();
    window.location.reload();
  };

  return (
    <IconButton 
      onClick={handleSignOut} 
      sx={{ 
        width: 40, height: 40,
        borderRadius: 1,
        backgroundColor: "grey.200",
        "&:hover": { backgroundColor: "grey.300" }
      }}
    >
      <LogoutRoundedIcon fontSize="small" />
    </IconButton>
  );
}
