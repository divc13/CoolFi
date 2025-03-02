import pandas as pd


# Load the datasets
merged_tweets = pd.read_csv("merged_tweets.csv")
sentiments = pd.read_csv("tweets_with_all_features_gpu.csv")

# Ensure the indices align correctly
if len(sentiments) != len(merged_tweets):
    raise ValueError("Row count mismatch: Ensure both CSVs have the same number of rows.")

# Concatenate the dataframes along columns (axis=1)
merged_tweets = pd.concat([merged_tweets, sentiments], axis=1)

# Save the updated dataframe
merged_tweets.to_csv("merged_tweets_with_sentiments.csv", index=False)

print("✅ Merging completed successfully!")



# Load datasets
tweets_df = pd.read_csv("merged_tweets.csv")
sentiments_df = pd.read_csv("tweets_with_all_features_gpu.csv")

# Merge sentiment scores into tweets dataset
tweets_df[["positive_score", "neutral_score", "negative_score"]] = sentiments_df

# Define crypto-related columns
crypto_columns = ["ETH", "BITCOIN", "SOLANA", "PEPE", "DOGE", "MAGA", "NEAR", "XRP"]

# Melt the dataframe to convert crypto mentions into a single column
tweets_df = tweets_df.melt(id_vars=["Date", "Likes", "Retweets", "Replies", "Views", 
                                     "positive_score", "neutral_score", "negative_score"], 
                            value_vars=crypto_columns, 
                            var_name="Crypto", 
                            value_name="Mentioned")

# Keep only rows where the cryptocurrency was mentioned (value = 1)
tweets_df = tweets_df[tweets_df["Mentioned"] == 1].drop(columns=["Mentioned"])

# Function to compute weighted mean
def weighted_mean(series, weights):
    return (series * weights).sum() / weights.sum() if weights.sum() > 0 else series.mean()

# Aggregation dictionary
agg_funcs = {
    "Likes": "sum",
    "Retweets": "sum",
    "Replies": "sum",
    "Views": "sum",
    "positive_score": [
        lambda x: weighted_mean(x, tweets_df.loc[x.index, "Likes"]),
        lambda x: weighted_mean(x, tweets_df.loc[x.index, "Retweets"]),
        lambda x: weighted_mean(x, tweets_df.loc[x.index, "Views"])
    ],
    "neutral_score": [
        lambda x: weighted_mean(x, tweets_df.loc[x.index, "Likes"]),
        lambda x: weighted_mean(x, tweets_df.loc[x.index, "Retweets"]),
        lambda x: weighted_mean(x, tweets_df.loc[x.index, "Views"])
    ],
    "negative_score": [
        lambda x: weighted_mean(x, tweets_df.loc[x.index, "Likes"]),
        lambda x: weighted_mean(x, tweets_df.loc[x.index, "Retweets"]),
        lambda x: weighted_mean(x, tweets_df.loc[x.index, "Views"])
    ],
}

# Perform groupby aggregation on Date & Crypto
compressed_df = tweets_df.groupby(["Date", "Crypto"]).agg(agg_funcs).reset_index()

# Rename columns to clarify weighted means
compressed_df.columns = [
    "Date", "Crypto", "Likes", "Retweets", "Replies", "Views",
    "positive_score_likes", "positive_score_retweets", "positive_score_views",
    "neutral_score_likes", "neutral_score_retweets", "neutral_score_views",
    "negative_score_likes", "negative_score_retweets", "negative_score_views",
]

# Save the final compressed dataset
compressed_df.to_csv("compressed_tweets.csv", index=False)
print("✅ Compressed data saved to compressed_tweets.csv")


# Load datasets
tweets_df = pd.read_csv("compressed_tweets.csv")
crypto_df = pd.read_csv("crypto_data.csv")

# Define a mapping from coin names to the standard crypto names
crypto_name_map = {
    "ethereum": "ETH",
    "bitcoin": "BITCOIN",
    "solana": "SOLANA",
    "pepe": "PEPE",
    "dogecoin": "DOGE",
    "maga": "MAGA",
    "near": "NEAR",
    "ripple": "XRP"
}

# Standardize coin names in crypto_data.csv
crypto_df["coin"] = crypto_df["coin"].str.lower().map(crypto_name_map)

# Rename column to match tweets data
crypto_df.rename(columns={"coin": "Crypto"}, inplace=True)
crypto_df.rename(columns={"date": "Date"}, inplace=True)

# Merge datasets on Date and Crypto
merged_df = pd.merge(tweets_df, crypto_df, on=["Date", "Crypto"], how="inner")

# Save the final merged dataset
merged_df.to_csv("final_combined_data.csv", index=False)

print("✅ Merged dataset saved as final_combined_data.csv")
