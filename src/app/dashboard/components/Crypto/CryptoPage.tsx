import React, { useEffect, useState, useCallback } from "react";
import { Box, Container, CircularProgress, Grid, Paper, Typography } from "@mui/material";
import axios from "axios";
import CryptoChart from "./CryptoChart";
import CryptoStats from "./CryptoStats";
import CryptoHeader from "./CryptoHeader";
import CryptoErrorSnackbar from "./CryptoErrorSnackbar";
import CryptoTweets from "./CryptoTweets";
import Copyright from "../Copyright";

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";

const CryptoPage = ({ coinId = "bitcoin" }) => {
  const [priceData, setPriceData] = useState([]);
  const [coinDetails, setCoinDetails] = useState<any>(null);
  const [tweets, setTweets] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("7");
  const [error, setError] = useState({ show: false, message: "" });
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingPage, setLoadingPage] = useState(true);

  const retryFetch = async (fetchFunction, retries = 3, delay = 1000) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fetchFunction();
      } catch (error) {
        console.warn(`Attempt ${attempt + 1} failed: ${error}`);
        if (attempt === retries) throw error;
        await new Promise((resolve) => setTimeout(resolve, delay * (2 ** attempt)));
      }
    }
  };
  
  const fetchCryptoDetails = useCallback(async () => {
    setLoadingPage(true);
    try {
      const detailsResponse = await retryFetch(() =>
        axios.get(`${COINGECKO_API_URL}/coins/${coinId}`)
      );
  
      const coinData = detailsResponse.data;
      setCoinDetails(coinData);
  
      if (coinId.toLowerCase() === "near") {
        setCoinDetails((prev) => ({
          ...prev,
          description: {
            ...prev.description,
            en: "NEAR Protocol is a layer-one blockchain that was designed as a community-run cloud computing platform and that eliminates some of the limitations that have been bogging competing blockchains, such as low transaction speeds, low throughput and poor interoperability. This provides the ideal environment for DApps and creates a developer and user-friendly platform. For instance, NEAR uses human-readable account names, unlike the cryptographic wallet addresses common to Ethereum. NEAR also introduces unique solutions to scaling problems and has its own consensus mechanism called Doomslug. NEAR Protocol is being built by the NEAR Collective, its community that is updating the initial code and releasing updates to the ecosystem. Its declared goal is to build a platform that is “secure enough to manage high value assets like money or identity and performant enough to make them useful for everyday people."
          },
        }));
      }
  
      const coinName = coinData?.name || coinId;
      const tweetsResponse = await retryFetch(() =>
        axios.get(`/api/getTweets?coin=${encodeURIComponent(coinName)}`)
      );
  
      setTweets(tweetsResponse.data?.tweets || []);
    } catch (error) {
      console.error("Final failure:", error);
      setError({ show: true, message: "Failed to load crypto details after retries" });
    } finally {
      setLoadingPage(false);
    }
  }, [coinId]);
  
  const fetchPriceData = useCallback(async () => {
    setLoadingChart(true);
    try {
      const priceResponse = await retryFetch(() =>
        axios.get(`${COINGECKO_API_URL}/coins/${coinId}/market_chart`, {
          params: { vs_currency: "usd", days: selectedPeriod },
        })
      );
  
      setPriceData(
        priceResponse.data.prices.map(([timestamp, price]: [number, number]) => ({
          timestamp,
          price,
        }))
      );
    } catch (error) {
      console.error("Final failure:", error);
      setError({ show: true, message: "Failed to load price data after retries" });
    } finally {
      setLoadingChart(false);
    }
  }, [coinId, selectedPeriod]);
  
  useEffect(() => {
    fetchCryptoDetails();
  }, [fetchCryptoDetails]);
  
  useEffect(() => {
    fetchPriceData();
  }, [fetchPriceData]);

  return (
    <Container maxWidth="xl" sx={{ width: "100%", px: { xs: 1, sm: 2, md: 4, lg: 6 }, py: 3, gap:2 }}>
      <CryptoErrorSnackbar error={error} handleClose={() => setError({ show: false, message: "" })} />

      {loadingPage ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2} sx={{ width: "100%", margin: "auto", mb: 0 }}>
          <Grid item xs={12} md={8} sx={{ overflow: "hidden" }}>
            <CryptoHeader
              coinName={coinDetails?.name || "Unknown"}
              coinImage={coinDetails?.image?.large || ""}
              currentPrice={coinDetails?.market_data?.current_price?.usd || 0}
              selectedPeriod={selectedPeriod}
              handlePeriodChange={(e, newPeriod) => setSelectedPeriod(newPeriod)}
            />

            {loadingChart ? (
              <Box display="flex" justifyContent="center" mt={2}>
                <CircularProgress />
              </Box>
            ) : (
              <CryptoChart priceData={priceData} />
            )}

            <Grid container spacing={1} mt={0} justifyContent="center">
              <Grid item xs={12}>
                <CryptoStats
                  marketCap={coinDetails?.market_data?.market_cap?.usd || 0}
                  volume={coinDetails?.market_data?.total_volume?.usd || 0}
                  priceChange={coinDetails?.market_data?.price_change_percentage_24h || 0}
                  circulatingSupply={coinDetails?.market_data?.circulating_supply || 0}
                  maxSupply={coinDetails?.market_data?.max_supply || "Unlimited"}
                  allTimeHigh={coinDetails?.market_data?.ath?.usd || 0}
                />
              </Grid>
            </Grid>

            <Paper elevation={3} sx={{ p: 3, mt: 3,mb:3, borderRadius: 2 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                About {coinDetails?.name}
              </Typography>
              <Typography variant="subtitle2" dangerouslySetInnerHTML={{ __html: coinDetails?.description?.en }} />
            </Paper>
            <Copyright />
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 2, position: "sticky", top: 0, backgroundColor: "background.paper", zIndex: 2, p: 2, borderRadius: "12px", boxShadow: 2, textAlign: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>Recent Tweets</Typography>
            </Box>

            <Box
              sx={{
                height: "150vh",
                overflowY: "auto",
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
                borderRadius: 2,
                p: 2,
                boxShadow: 2,
                backgroundColor: "background.paper",
              }}
            >
              <CryptoTweets tweets={tweets} />
            </Box>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default CryptoPage;
