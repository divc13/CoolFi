"use client";

import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Grid,
  IconButton,
  useTheme,
} from "@mui/material";
import { ChatBubbleOutline, Repeat, FavoriteBorder, OpenInNew, Visibility } from "@mui/icons-material";
import Image from "next/image";
import type { Tweet } from "agent-twitter-client";
import Link from "next/link";

const CryptoTweets = ({ tweets }: { tweets: Tweet[] }) => {
  const theme = useTheme();

  // ✅ Format tweet timestamps correctly
  const formatTimestamp = (timestamp?: number): string => {
    if (!timestamp) return "Unknown Date";
    const date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Box>
      {tweets.length > 0 ? (
        <Grid container spacing={1}>
          {tweets.map((tweet) => (
            <Grid item xs={12} key={tweet.id}>
              <Card
                sx={{
                  backgroundColor: theme.palette.mode === "dark" ? "#1E1E1E" : "#F9F9F9",
                  p: 1.5,
                  borderRadius: 2,
                  boxShadow: theme.shadows[2],
                  transition: "0.2s ease-in-out",
                  "&:hover": { boxShadow: theme.shadows[4] },
                }}
              >
                <CardContent sx={{ p: 1.5 }}>
                  {/* ✅ User Info */}
                  <Box display="flex" alignItems="center" mb={1}>
                    <Avatar src={tweet.photos[0]?.url || ""} alt={tweet.username} sx={{ width: 36, height: 36, mr: 1 }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold" fontSize="0.85rem">
                        {tweet.name || "Unknown"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        @{tweet.username} • {formatTimestamp(tweet.timestamp)}
                      </Typography>
                    </Box>
                    <Link href={tweet.permanentUrl || ""} target="_blank">
                    <IconButton sx={{ ml: "auto" }}>
                      <OpenInNew fontSize="small" />
                    </IconButton>
                    </Link>
                  </Box>

                  {/* ✅ Tweet Content */}
                  <Typography variant="body2" sx={{ mb: 1, fontSize: "0.9rem", lineHeight: 1.3 }}>
                    {tweet.text}
                  </Typography>

                  {/* ✅ Tweet Media */}
                  {tweet.photos.length > 0 && (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${Math.min(tweet.photos.length, 2)}, 1fr)`,
                        gap: 0.5,
                        my: 1,
                      }}
                    >
                      {tweet.photos.map((photo, index) => (
                        <Box key={index} sx={{ position: "relative", width: "100%", height: 140 }}>
                          <Image
                            src={photo.url}
                            alt="Tweet Image"
                            layout="fill"
                            objectFit="cover"
                            style={{ borderRadius: 6 }}
                          />
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* ✅ Tweet Metrics */}
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mt: 1, borderTop: `1px solid ${theme.palette.divider}`, pt: 0.5 }}
                  >
                    {[
                      { icon: <FavoriteBorder fontSize="small" />, value: tweet.likes || 0 },
                      { icon: <ChatBubbleOutline fontSize="small" />, value: tweet.replies || 0 },
                      { icon: <Repeat fontSize="small" />, value: tweet.retweets || 0 },
                      { icon: <Visibility fontSize="small" />, value: tweet.views || 0 },
                    ].map(({ icon, value }, index) => (
                      <Box key={index} display="flex" alignItems="center">
                        {icon}
                        <Typography variant="caption" sx={{ ml: 0.5 }}>
                          {value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body2" sx={{ textAlign: "center", color: "text.secondary" }}>
          No tweets found.
        </Typography>
      )}
    </Box>
  );
};

export default CryptoTweets;
