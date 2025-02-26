import * as React from 'react';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Copyright from '../../components/Copyright';
import CustomizedDataGrid from './CustomizedDataGrid';
import HighlightedCard from './HighlightedCard';
import Composition from './Composition';
import HighlightedCard_2 from './HighlightedCard_2';

export default function MainGrid() {
  return (
    <Box sx={{ width: '92%', maxWidth: { sm: '100%', md: '100%' }}}>

      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Overview
      </Typography>
    
      <Grid container spacing={2} sx={{ minHeight: "100%", alignItems: "stretch" }}>
  {/* Left: Composition (Takes Half of the Screen on Medium Screens & Above) */}
  <Grid 
    size={{ xs: 12, md: 6 }} 
    sx={{ display: "flex", flexDirection: "column", height: "100%" }}
  >
    <Composition />
  </Grid>

  {/* Right: Highlighted Cards (Stacked, Matching Composition's Height) */}
  <Grid 
    size={{ xs: 12, md: 6 }} 
    container 
    direction="column" 
    spacing={2} 
    sx={{ display: "flex", flexDirection: "column", height: "100%" }}
  >
    <Grid size={{ xs: 12}} sx={{ flexGrow: 1, display: "flex" }}>
      <HighlightedCard_2 />
    </Grid>
    <Grid size={{ xs: 12}} sx={{ flexGrow: 1, display: "flex" }}>
      <HighlightedCard />
    </Grid>
  </Grid>
</Grid>



      <Typography component="h2" variant="h6" sx={{ mb: 2, mt: 3 }}>
        Coin Details
      </Typography>

      <Grid container spacing={2} columns={12}  sx={{ overflowX: "auto", width:"100%" }}>
        <Grid size={{ xs: 12, lg: 12 }} sx={{ overflowX: "auto" , width: "100%"}}>
          <CustomizedDataGrid />
        </Grid>
      </Grid>
      
      <Copyright sx={{ my: 4 }} />
    </Box>
  );
}
