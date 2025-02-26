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
        width: 40, height: 40, // ✅ Small square button
        borderRadius: 1, // ✅ Slightly rounded edges
        backgroundColor: "grey.200", // ✅ Light grey background
        "&:hover": { backgroundColor: "grey.300" } // ✅ Slightly darker on hover
      }}
    >
      <LogoutRoundedIcon fontSize="small" />
    </IconButton>
  );
}
