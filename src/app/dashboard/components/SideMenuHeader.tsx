import React from "react";
import { Box, Typography } from "@mui/material";
import Image from "next/image";
import Link from "@mui/material/Link";


const SideMenuHeader: React.FC = () => {
    return (
      <Box
        sx={{
          position: "relative",  // Enables absolute positioning inside
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
          p: 1,
        }}
      >
        <Link href="/dashboard/home" underline="none" color="inherit">
      <Box display="flex" alignItems="center" gap={1} sx={{display: "flex",flexDirection:"column"}}>
        <Image src="/coolfi.png" alt="CoolFi" width={70} height={70} />
        <Typography variant="h2" fontWeight="bold" color="primary">
          CoolFi
        </Typography>
      </Box>
    </Link>

      </Box>
    );
  };
  
  export default SideMenuHeader;
