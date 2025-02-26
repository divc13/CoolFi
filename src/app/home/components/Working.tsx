"use client";

import * as React from "react";
import { Container, Typography, Box, Paper } from "@mui/material";
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from "@mui/lab";

const steps = [
  {
    label: "Connect Your Wallet",
    description:
      "Start by securely connecting your crypto wallet to CoolFi. This enables seamless transactions and portfolio tracking on our platform.",
    color: "primary",
  },
  {
    label: "Ask CoolFi Assistant for Portfolio Analysis",
    description:
      "CoolFi's AI-powered assistant analyzes your portfolio, providing deep insights and optimization strategies tailored to your assets.",
    color: "secondary",
  },
  {
    label: "Ask CoolFi Assistant to Make Swaps",
    description:
      "Let the CoolFi Assistant handle your swaps. Get AI-driven trade recommendations and execute transactions efficiently with one click.",
    color: "success",
  },
  {
    label: 'Say "Hi" to CoolFi on X (@iamCoolFi)',
    description:
      "Engage with CoolFi on X to receive real-time market updates and even execute transactions directly through X interactions.",
    color: "info",
  },
];

export default function HowItWorks() {
  return (
    <Container id="working" maxWidth="md" sx={{ pt: { xs: 4, sm: 12 }, pb: { xs: 8, sm: 16 } }}>
      <Typography variant="h2" align="center" gutterBottom>
        Begin Your Journey
      </Typography>

      <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        CoolFi simplifies crypto trading with AI-powered insights, seamless swaps, and real-time updates via X. 
        Let CoolFi Assistant optimize your portfolio and execute transactions effortlessly.
      </Typography>

      <Timeline position="alternate">
        {steps.map((step, index) => (
            <TimelineItem key={index}>
            <TimelineSeparator>
              {/*@ts-expect-error: type mismatch*/}
              <TimelineDot color={step.color} />
              {index !== steps.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent sx={{ textAlign: "left" }}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  backgroundColor: "background.paper",
                  textAlign: "left",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {step.label}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  {step.description}
                </Typography>
              </Paper>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Container>
  );
}
