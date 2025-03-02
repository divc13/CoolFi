import * as React from "react";
import Divider from "@mui/material/Divider";
import Drawer, { drawerClasses } from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MenuContent from "./MenuContent";
import RegisterWallet from "./RegisterWallet";
import OptionsMenu from "./OptionsMenu";
import ColorModeIconDropdown from "@/app/shared-theme/ColorModeIconDropdown";
import Box from "@mui/material/Box";
import SideMenuHeader from "./SideMenuHeader";
import { useBitteWallet } from "@bitte-ai/react";

interface SideMenuMobileProps {
  open: boolean | undefined;
  toggleDrawer: (newOpen: boolean) => () => void;
}

export default function SideMenuMobile({ open, toggleDrawer }: SideMenuMobileProps) {

  const { isConnected, selector, connect, activeAccountId } = useBitteWallet();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: "none",
          backgroundColor: "background.paper",
        },
      }}
    >
      <Stack sx={{ maxWidth: "70dvw", height: "100%" }}>
        {/* Header */}
        <SideMenuHeader/> 
        <Divider />
        <Stack sx={{ flexGrow: 1 }}>
          <MenuContent />
          <Divider />
        </Stack>
        {/* Footer */}
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
      </Stack>
    </Drawer>
  );
}