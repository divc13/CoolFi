import * as React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Container,
  Link,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function FAQ() {
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange =
    (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  return (
    <Container
      id="faq"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: { xs: 3, sm: 6 },
      }}
    >
      <Typography
        component="h2"
        variant="h2"
        sx={{
          color: "text.primary",
          width: { sm: "100%", md: "60%" },
          textAlign: { sm: "left", md: "center" },
        }}
      >
        Frequently Asked Questions
      </Typography>
      <Box sx={{ width: "100%" }}>
        <Accordion expanded={expanded === "panel1"} onChange={handleChange("panel1")}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
            <Typography component="span" variant="h6">
              How do I contact customer support if I have a question or issue?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="subtitle2" gutterBottom sx={{ maxWidth: { sm: "100%", md: "90%" } }}>
              You can reach our customer support team by emailing&nbsp;
              <Link href="mailto:2cool.fi@gmail.com">2cool.fi@gmail.com</Link>.
              We’re here to assist you promptly.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === "panel2"} onChange={handleChange("panel2")}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2-content" id="panel2-header">
            <Typography component="span" variant="h6">
              Is CoolFi custodial? Do I need to deposit funds?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="subtitle2" gutterBottom sx={{ maxWidth: { sm: "100%", md: "90%" } }}>
              CoolFi is a non-custodial, AI-powered DeFi platform.
              For Portfolio Optimization: CoolFi provides AI-based insights to enhance your portfolio without requiring deposits. You maintain full control of your assets on-chain while leveraging AI-powered strategies for optimal allocation.
              <br />
              Your funds remain fully transparent, secure, and accessible at all times.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === "panel3"} onChange={handleChange("panel3")}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel3-content" id="panel3-header">
            <Typography component="span" variant="h6">
              How does CoolFi help with portfolio management?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="subtitle2" gutterBottom sx={{ maxWidth: { sm: "100%", md: "90%" } }}>
              CoolFi utilizes AI to analyze your portfolio and market trends in real-time. 
              It suggests optimal asset allocations, diversification strategies, and rebalancing recommendations to help you maximize returns while managing risk effectively.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === "panel4"} onChange={handleChange("panel4")}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel4-content" id="panel4-header">
            <Typography component="span" variant="h6">
              What is one-click trading via X, and how does it work?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="subtitle2" gutterBottom sx={{ maxWidth: { sm: "100%", md: "90%" } }}>
              CoolFi provides AI-generated real-time trade insights via X. 
              When a profitable trading opportunity arises, users receive a one-click trade execution link for instant cross-chain swaps—eliminating complexity and manual trade execution.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Container>
  );
}
