import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Link from 'next/link';

export default function HighlightedCard_2() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Card sx={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}> 
      <CardContent>
        <InsightsRoundedIcon />
        <Typography
          component="h2"
          variant="subtitle2"
          gutterBottom
          sx={{ fontWeight: '600' }}
        >
          Use our CoolFi AI Assistant!
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: '8px' }}>
          Get insights into your portfolio and make cross-chain swaps effortlessly. Stay ahead of the market with AI-driven strategies.
        </Typography>


        <Link href="/dashboard/chatbot" passHref>
        <Button
          variant="contained"
          size="small"
          color="primary"
          endIcon={<ChevronRightRoundedIcon />}
          fullWidth={isSmallScreen}
        >
          Get Started
        </Button>
        </Link>
      </CardContent>
    </Card>
  );
}