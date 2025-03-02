import os
import pandas as pd
import requests
import time
import sys
from datetime import datetime

# Get the arguments
today = sys.argv[1]  # Format: YYYY-MM-DD
lastScrape = sys.argv[2]  # Format: YYYY-MM-DD

# Define paths and coins
DATA_DIR = "./tweet_data/"
OUTPUT_CSV = "merged_tweets.csv"
COINS = ["ETH", "BITCOIN", "SOLANA", "PEPE", "DOGE", "MAGA", "NEAR", "XRP"]

# Convert dates to datetime objects
today_dt = datetime.strptime(today, "%Y-%m-%d")
lastScrape_dt = datetime.strptime(lastScrape, "%Y-%m-%d")

# Get all xlsx files and filter based on the date in filename
xlsx_files = [
    f for f in os.listdir(DATA_DIR) 
    if f.endswith(".xlsx") and "tweets_" in f
]

filtered_files = []
for file in xlsx_files:
    try:
        file_date_str = file.replace("tweets_", "").replace(".xlsx", "")
        file_date = datetime.strptime(file_date_str, "%Y-%m-%d")

        # Only keep files within the date range
        if lastScrape_dt < file_date <= today_dt:
            filtered_files.append(file)
    except ValueError:
        continue  # Skip files with incorrect format

# Load existing merged data if it exists
if os.path.exists(OUTPUT_CSV):
    existing_df = pd.read_csv(OUTPUT_CSV)
    existing_dates = set(existing_df["date"])
else:
    existing_df = None
    existing_dates = set()

# Initialize an empty list to store DataFrames
dfs = []

for file in filtered_files:
    file_path = os.path.join(DATA_DIR, file)
    
    # Read all sheets
    xls = pd.ExcelFile(file_path)

    for coin in COINS:
        if coin in xls.sheet_names:  # Ensure sheet exists
            df = pd.read_excel(xls, sheet_name=coin)
            
            # Extract date from filename and add as a new column
            df["date"] = file.replace("tweets_", "").replace(".xlsx", "")

            # Skip already present dates
            if df["date"].iloc[0] in existing_dates:
                continue
            
            # Add coin presence columns
            for coin1 in COINS:
                df[coin1] = 0
            df[coin] = 1

            if not df.empty:
                dfs.append(df)

# If there are new data frames, merge and save
if dfs:
    new_data = pd.concat(dfs, ignore_index=True)
    
    if existing_df is not None:
        final_df = pd.concat([existing_df, new_data], ignore_index=True)
    else:
        final_df = new_data

    final_df.to_csv(OUTPUT_CSV, index=False)
    print(f"Updated data saved to {OUTPUT_CSV}")
else:
    print("No new data to append.")



# Get the arguments
today = sys.argv[1]  # Format: YYYY-MM-DD
lastScrape = sys.argv[2]  # Format: YYYY-MM-DD

OUTPUT_CSV = "crypto_data1.csv"
COINS = ["ethereum", "bitcoin", "solana", "pepe", "dogecoin", "maga", "near", "ripple"]

API_URL = "https://api.coingecko.com/api/v3/coins/{coin}/market_chart/range"
RATE_LIMIT_DELAY = 2  # Seconds to wait between API calls

# Convert input dates to timestamps
start_ts = int(datetime.strptime(lastScrape, "%Y-%m-%d").timestamp())
end_ts = int(datetime.strptime(today, "%Y-%m-%d").timestamp())

# Load existing data if the CSV exists
if os.path.exists(OUTPUT_CSV):
    existing_df = pd.read_csv(OUTPUT_CSV)
    existing_dates = set(existing_df["date"])
else:
    existing_df = None
    existing_dates = set()

# Function to fetch data from CoinGecko
def fetch_historical_data(coin, start_ts, end_ts):
    url = API_URL.format(coin=coin)
    params = {"vs_currency": "usd", "from": start_ts, "to": end_ts}
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return coin, response.json()
    else:
        print(f"Error {response.status_code} fetching {coin}")
        return coin, None

# Fetch and process data
new_data = []
for coin in COINS:
    time.sleep(RATE_LIMIT_DELAY)  # Respect API rate limits
    coin, data = fetch_historical_data(coin, start_ts, end_ts)
    if data:
        prices = data.get("prices", [])
        market_caps = data.get("market_caps", [])
        volumes = data.get("total_volumes", [])

        for i in range(len(prices)):
            date = datetime.utcfromtimestamp(prices[i][0] / 1000).strftime('%Y-%m-%d')
            
            # Skip dates already in CSV to avoid duplicates
            if date in existing_dates:
                continue

            new_data.append({
                "date": date,
                "coin": coin,
                "price": prices[i][1],
                "market_cap": market_caps[i][1] if i < len(market_caps) else None,
                "volume": volumes[i][1] if i < len(volumes) else None
            })

# Append new data if available
if new_data:
    new_df = pd.DataFrame(new_data)
    
    if existing_df is not None:
        final_df = pd.concat([existing_df, new_df], ignore_index=True)
    else:
        final_df = new_df

    final_df.to_csv(OUTPUT_CSV, index=False)
    print(f"Updated data saved to {OUTPUT_CSV}")
else:
    print("No new data to append.")