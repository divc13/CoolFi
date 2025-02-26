import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';

const items = [
  {
    icon: <SettingsSuggestRoundedIcon />,
    title: 'AI-Driven Trading ',
    description:
      'AI-driven sentiment analysis ensures your investments adapt to real-time market trends.',
  },
  {
    icon: <ConstructionRoundedIcon />,
    title: 'On-Chain Abstraction',
    description:
      'Enjoy seamless portfolio management without dealing with blockchain complexities.',
  },
  {
    icon: <ThumbUpAltRoundedIcon />,
    title: 'Cross-Chain Compatibility',
    description:
      'Effortlessly swap and rebalance assets across multiple blockchain networks.',
  },
  {
    icon: <AutoFixHighRoundedIcon />,
    title: 'Just Ask AI',
    description:
      'Simple as that, just ask to our Ai CoolFi assistant, get detailed insights and swap as you want.',
  },
  {
    icon: <SupportAgentRoundedIcon />,
    title: 'Real-Time X Alerts',
    description:
      'Get instant notifications with actionable insights and one-click trade execution links',
  },
  {
    icon: <QueryStatsRoundedIcon />,
    title: 'Non-Custodial & Transparent',
    description:
      'Maintain full control over your funds while benefiting from AI-driven recommendations.',
  },
];

export default function Highlights() {
  return (
    <Box
      id="highlights"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        color: 'white',
        bgcolor: 'grey.900',
      }}
    >
      <Container
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 3, sm: 6 },
        }}
      >
        <Box
          sx={{
            width: { sm: '100%', md: '60%' },
            textAlign: { sm: 'left', md: 'center' },
          }}
        >
          <Typography component="h2" variant="h2" gutterBottom>
            Highlights: Why CoolFi ?
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'grey.400' }}>
          Explore why CoolFi stands out: AI-driven adaptability, seamless on-chain integration, cross-chain compatibility, and real-time market insights. Enjoy a user-friendly experience, secure transactions, and precision-driven portfolio management.
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {items.map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Stack
                direction="column"
                component={Card}
                spacing={1}
                useFlexGap
                sx={{
                  color: 'inherit',
                  p: 3,
                  height: '100%',
                  borderColor: 'hsla(220, 25%, 25%, 0.3)',
                  backgroundColor: 'grey.800',
                }}
              >
               <Box
                sx={{
                    opacity: '50%', // Keeps transparency
                }}
                >{React.cloneElement(item.icon, { style: { width: 40, height: 40  }})}</Box>
                <div>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: 'grey.400' }}>
                    {item.description}
                  </Typography>
                </div>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
