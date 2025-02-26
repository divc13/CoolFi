"use client";

import * as React from "react";
import { useState } from "react";
import { usePathname } from "next/navigation"; // ✅ Correct Hook
import Link from "next/link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import MonetizationOnRoundedIcon from "@mui/icons-material/MonetizationOnRounded";
import { useTheme } from "@mui/material/styles";
import tokensJson from "@/app/near-intent/config/tokens.json";

// ✅ Extract token data dynamically
const tokens = [
  ...tokensJson.tokens.mainnet.unified_tokens,
  ...tokensJson.tokens.mainnet.single_chain_tokens,
];

// ✅ Sort tokens alphabetically
const coinsList = tokens
  .map(token => ({
    coinGeckoId: token.cgId,
    icon: token.icon,
    name: token.name,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export default function MenuContent() {
  const pathname = usePathname(); // ✅ Get the current route
  const theme = useTheme();
  const [coinsOpen, setCoinsOpen] = useState(true);

  // Function to check if a menu item is active
  const isActive = (path: string) => pathname === path || pathname.startsWith(path);

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <List dense>
        {/* Home Button */}
        <ListItem disablePadding>
          <Link href="/dashboard/home" passHref legacyBehavior>
            <ListItemButton
              component="a"
              sx={{
                backgroundColor: isActive("/dashboard/home") ? theme.palette.action.selected : "inherit",
                borderRadius: 2,
              }}
            >
              <ListItemIcon><HomeRoundedIcon /></ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
          </Link>
        </ListItem>

        {/* Account Page
        <ListItem disablePadding>
          <Link href="/dashboard/account" passHref legacyBehavior>
            <ListItemButton
              component="a"
              sx={{
                backgroundColor: isActive("/dashboard/account") ? theme.palette.action.selected : "inherit",
                borderRadius: 2,
              }}
            >
              <ListItemIcon><AccountCircleRoundedIcon /></ListItemIcon>
              <ListItemText primary="Account" />
            </ListItemButton>
          </Link>
        </ListItem> */}

        {/* Swapper AI Page */}
        <ListItem disablePadding>
          <Link href="/dashboard/chatbot" passHref legacyBehavior>
            <ListItemButton
              component="a"
              sx={{
                backgroundColor: isActive("/dashboard/chatbot") ? theme.palette.action.selected : "inherit",
                borderRadius: 2,
              }}
            >
              <ListItemIcon><SwapHorizRoundedIcon /></ListItemIcon>
              <ListItemText primary="Swapper AI" />
            </ListItemButton>
          </Link>
        </ListItem>

        {/* X Notifier Page */}
        <ListItem disablePadding>
          <Link href="/dashboard/x-notifier" passHref legacyBehavior>
            <ListItemButton
              component="a"
              sx={{
                backgroundColor: isActive("/dashboard/x-notifier") ? theme.palette.action.selected : "inherit",
                borderRadius: 2,
              }}
            >
              <ListItemIcon><NotificationsRoundedIcon /></ListItemIcon>
              <ListItemText primary="X Notifier" />
            </ListItemButton>
          </Link>
        </ListItem>

        {/* Crypto Tab (Moved to Last) */}
        <ListItem disablePadding>
          <ListItemButton onClick={() => setCoinsOpen(!coinsOpen)}>
            <ListItemIcon><MonetizationOnRoundedIcon /></ListItemIcon>
            <ListItemText primary="Crypto" />
            {coinsOpen ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
          </ListItemButton>
        </ListItem>

        <Collapse in={coinsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {coinsList.map((coin) => {
              const coinPath = `/dashboard/crypto/${coin.coinGeckoId}`;
              return (
                <ListItem key={coin.coinGeckoId} disablePadding sx={{ pl: 2 }}>
                  <Link href={coinPath} passHref legacyBehavior>
                    <ListItemButton
                      component="a"
                      sx={{
                        backgroundColor: isActive(coinPath) ? theme.palette.action.selected : "inherit",
                        borderRadius: 2,
                      }}
                    >
                      <ListItemIcon>
                        <Avatar 
                          src={coin.icon} 
                          alt={coin.name} 
                          sx={{ width: 24, height: 24 }} 
                        />
                      </ListItemIcon>
                      <ListItemText primary={coin.name} />
                    </ListItemButton>
                  </Link>
                </ListItem>
              );
            })}
          </List>
        </Collapse>
      </List>
    </Stack>
  );
}
