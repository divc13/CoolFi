import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import XIcon from '@mui/icons-material/X';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Link from 'next/link';

export default function HighlightedCard() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Card sx={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>

      <CardContent>
        <XIcon />
        <Typography
          component="h2"
          variant="subtitle2"
          gutterBottom
          sx={{ fontWeight: '600' }}
        >
          Get Real-Time Crypto Swap Alerts!
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: '8px' }}>
          Receive instant X notifications about cryptocurrency swaps and execute swaps directly using the link provided by CoolFi on X.
        </Typography>

        <Link href="/dashboard/x-notifier" passHref>
        <Button
          variant="contained"
          size="small"
          color="primary"
          endIcon={<ChevronRightRoundedIcon />}
          fullWidth={isSmallScreen}
        >
          Say Hi
        </Button>
        </Link>
      </CardContent>
    </Card>
  );
}