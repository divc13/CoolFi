"use client";

import { Box } from "@mui/material";
import Main from "./components/Main";

export default function Home() {
  return (
    <Box alignSelf="normal" margin={{ md: "inherit !important", lg: "0 !important" }}>
      <Main />
    </Box>
  );
}
