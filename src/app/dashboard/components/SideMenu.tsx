"use client";

import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SideMenuHeader from "./SideMenuHeader";
import MenuContent from "./MenuContent";
import RegisterWallet from "./RegisterWallet";
import OptionsMenu from "./OptionsMenu";
import ColorModeIconDropdown from "@/app/shared-theme/ColorModeIconDropdown";
import { useBitteWallet } from "@bitte-ai/react";
import "@near-wallet-selector/modal-ui/styles.css"

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
  },
});

export default function SideMenu() {
    const { isConnected, selector, connect, activeAccountId } = useBitteWallet();

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "none", lg: "block" },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: "background.paper",
        },
      }}
    >
      {/* Header Section */}
      <Box sx={{ display: "flex", mt: "calc(var(--template-frame-height, 0px) + 4px)", p: 1.5, flexDirection: "column" }}>
        <SideMenuHeader />
      </Box>
      
      <Divider />

      {/* Scrollable Menu Content */}
      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        <MenuContent />
      </Box>

      {/* Fixed Footer Section */}
      <Box
        sx={{
          position: "sticky",
          bottom: 0,
          left: 0,
          width: "100%",
          backgroundColor: "background.paper",
          borderTop: "1px solid",
          borderColor: "divider",
          p: 2,
        }}
      >
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "center", gap: 1 }}>
          {isConnected ? (
            <>
              <Box sx={{ mr: "auto" }}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {activeAccountId}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: "16px" }}>
                  Wallet Connected
                </Typography>
              </Box>
              <OptionsMenu />
              <ColorModeIconDropdown />
            </>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, p: 0 }}>
              <RegisterWallet />
              <ColorModeIconDropdown />
            </Box>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}
