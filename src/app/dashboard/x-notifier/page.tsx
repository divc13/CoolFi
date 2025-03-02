"use client";

import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from "@mui/lab";
import { X } from "@mui/icons-material"; // Replacing Twitter with X icon
import Link from "next/link";

export default function CryptoUpdates() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Container maxWidth="md" sx={{ textAlign: "center", py: 4, margin: { md: "inherit !important", lg: "0 !important" } }}>
      <Paper
        elevation={4}
        sx={{
          p: isMobile ? 2 : 4,
          borderRadius: 3,
          bgcolor: isDarkMode ? "#010101" : "#f9f9f9",
          boxShadow: isDarkMode ?"0px 0px 20px rgba(255, 255, 255, 0.5)":  "0px 0px 20px rgba(0, 0, 0, 0.5)", 
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center">
          <X color="primary" sx={{ fontSize: 50, mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Join @iamCoolFi for Real-Time Crypto Insights
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Get AI-powered sentiment analysis and swap suggestions to maximize
            your profit.
          </Typography>
          <Link href="https://twitter.com/iamCoolFi" passHref>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<X />}
            >
              Follow on X (Twitter)
            </Button>
          </Link>
        </Box>
      </Paper>

      <Paper
        elevation={4}
        sx={{
          mt: 4,
          p: isMobile ? 2 : 4,
          borderRadius: 3,
          bgcolor: isDarkMode ? "#000000" : "#fff",
            boxShadow: isDarkMode ?"0px 0px 20px rgba(255, 255, 255, 0.5)":  "0px 0px 20px rgba(0, 0, 0, 0.5)", 
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          How to Register?
        </Typography>
        <Timeline position="alternate">
          {[
            {
              color: "primary",
              title: "Step 1",
              text: 'Send a "Hi" message to @iamCoolFi on X.',
            },
            {
              color: "secondary",
              title: "Step 2",
              text: "You'll receive a reply email with a secure link to connect your wallet.",
            },
            {
              color: "success",
              title: "Step 3",
              text: "Once connected, you'll get real-time updates directly on X!",
            },
          ].map((step, index) => (
            <TimelineItem key={index}>
              <TimelineSeparator>
                {/* @ts-expect-error : type mismatch */}
                <TimelineDot color={step.color} />
                {index < 2 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Paper
                  elevation={3}
                  sx={{
                    p: 2,
                    bgcolor: isDarkMode ? "#222" : "f5f5f5",
                    textAlign: "center",
                }}        

                >
                  <Typography variant="h6" fontWeight="bold">
                    {step.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {step.text}
                  </Typography>
                </Paper>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
        <Box textAlign="center" mt={3}>
          <Button
            variant="outlined"
            color="primary"
            href="https://twitter.com/messages/compose?recipient_id=iamCoolFi"
          >
            Send Hi Message
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}