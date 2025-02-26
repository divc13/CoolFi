"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { styled, alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import MenuItem from "@mui/material/MenuItem";
import Drawer from "@mui/material/Drawer";
import MenuIcon from "@mui/icons-material/Menu";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ColorModeIconDropdown from "../../shared-theme/ColorModeIconDropdown";
import Link from "next/link";

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexShrink: 0,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  backdropFilter: "blur(24px)",
  border: "1px solid",
  borderColor: (theme).palette.divider,
  backgroundColor: alpha(theme.palette.background.default, 0.4),
  boxShadow: (theme).shadows[1],
  padding: "8px 12px",
}));

const sections = [
  { id: "hero", label: "CoolFi" },
  { id: "features", label: "Features" },
  { id: "highlights", label: "Highlights" },
  { id: "working", label: "Begin Your Journey" },
  { id: "faq", label: "FAQ" },
];

export default function AppAppBar() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  useEffect(() => {
    const observerOptions = {
      root: null, // Viewport
      rootMargin: "-50px", // Adjust for better detection
      threshold: 0.5, // Trigger when 50% of section is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <AppBar
      position="fixed"
      enableColorOnDark
      sx={{
        boxShadow: 0,
        bgcolor: "transparent",
        backgroundImage: "none",
        mt: "calc(var(--template-frame-height, 0px) + 28px)",
      }}
    >
      <Container maxWidth="lg">
        <StyledToolbar variant="dense" disableGutters>
          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", px: 0 }}>
          <Box sx={{ display: { xs: "flex", md: "none" }, gap: 1 }}>
          <Link href="/dashboard" target="_blank" rel="noopener noreferrer">
                  <Button color="primary" variant="contained" size="small">
                    Launch App
                  </Button>
                </Link>
          </Box>
            {/* <Link href="/home" passHref>
              <Button variant="outlined" color="info" size="small" sx={{
                      fontWeight: activeSection === "hero" ? "bold" : "normal",
                    //   textDecoration: activeSection === id ? "underline" : "none",
                    }}>
                CoolFi
              </Button>
            </Link> */}

            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              {sections.map(({ id, label }) => (
                <Link key={id} href={`#${id}`} passHref>
                  <Button
                    variant="text"
                    color={activeSection === id ? "primary" : "info"}
                    size="small"
                    sx={{
                      fontWeight: activeSection === id ? "bold" : "normal",
                    //   textDecoration: activeSection === id ? "underline" : "none",
                    }}
                  >
                    {label}
                  </Button>
                </Link>
              ))}
            </Box>
          </Box>

          <Box
            sx={{
                display: { xs: "none", md: "flex" },
                gap: 1,
                alignItems: "center",
            }}
          >
            <Link href="/dashboard" target="_blank" rel="noopener noreferrer">
                  <Button color="primary" variant="contained" size="small">
                    Launch App
                  </Button>
                </Link>
            <ColorModeIconDropdown />
          </Box>
          
          <Box sx={{ display: { xs: "flex", md: "none" }, gap: 1 }}>
            <ColorModeIconDropdown size="medium" />
            <IconButton aria-label="Menu button" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="top"
              open={open}
              onClose={toggleDrawer(false)}
              PaperProps={{
                sx: {
                  top: "var(--template-frame-height, 0px)",
                },
              }}
            >
              <Box sx={{ p: 2, backgroundColor: "background.default" }}>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <IconButton onClick={toggleDrawer(false)}>
                    <CloseRoundedIcon />
                  </IconButton>
                </Box>

                {sections.map(({ id, label }) => (
                  <MenuItem key={id}>
                    <Link href={`#${id}`} passHref>
                      <Button
                        variant="text"
                        color={activeSection === id ? "primary" : "info"}
                        fullWidth
                        sx={{
                          fontWeight: activeSection === id ? "bold" : "normal",
                        }}
                      >
                        {label}
                      </Button>
                    </Link>
                  </MenuItem>
                ))}

              </Box>
            </Drawer>
          </Box>
        </StyledToolbar>
      </Container>
    </AppBar>
  );
}

