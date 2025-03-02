import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.model_selection import train_test_split, TimeSeriesSplit
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import xgboost as xgb



# Load data
df = pd.read_csv("final_combined_data.csv", parse_dates=["Date"])

# Sort data for time series processing
df = df.sort_values(by=["Crypto", "Date"]).reset_index(drop=True)

# Check for missing values
print(df.isnull().sum())



# Time-based features
df["day_of_week"] = df["Date"].dt.dayofweek  # 0 = Monday, 6 = Sunday
df["is_weekend"] = df["day_of_week"].isin([5, 6]).astype(int)  # 1 if Saturday/Sunday

# Market Features
df["log_return_1d"] = np.log(df.groupby("Crypto")["price"].shift(0) / df.groupby("Crypto")["price"].shift(1))
df["log_return_5d"] = np.log(df.groupby("Crypto")["price"].shift(0) / df.groupby("Crypto")["price"].shift(5))

df["market_cap_change"] = df.groupby("Crypto")["market_cap"].pct_change()
df["volume_change"] = df.groupby("Crypto")["volume"].pct_change()

# Volatility (Rolling Std Dev of log returns)
df["volatility_3d"] = df.groupby("Crypto")["log_return_1d"].transform(lambda x: x.rolling(3).std())
df["volatility_7d"] = df.groupby("Crypto")["log_return_1d"].transform(lambda x: x.rolling(7).std())



# Sentiment weighted by engagement
df["pos_sentiment_weighted"] = (
    df["positive_score_likes"] * df["Likes"] + 
    df["positive_score_retweets"] * df["Retweets"] + 
    df["positive_score_views"] * df["Views"]
)

df["neu_sentiment_weighted"] = (
    df["neutral_score_likes"] * df["Likes"] + 
    df["neutral_score_retweets"] * df["Retweets"] + 
    df["neutral_score_views"] * df["Views"]
)

df["neg_sentiment_weighted"] = (
    df["negative_score_likes"] * df["Likes"] + 
    df["negative_score_retweets"] * df["Retweets"] + 
    df["negative_score_views"] * df["Views"]
)

# Rolling averages for smoothing trends
df["pos_sentiment_3d"] = df.groupby("Crypto")["pos_sentiment_weighted"].transform(lambda x: x.rolling(3).mean())
df["pos_sentiment_7d"] = df.groupby("Crypto")["pos_sentiment_weighted"].transform(lambda x: x.rolling(7).mean())

df["neu_sentiment_3d"] = df.groupby("Crypto")["neu_sentiment_weighted"].transform(lambda x: x.rolling(3).mean())
df["neu_sentiment_7d"] = df.groupby("Crypto")["neu_sentiment_weighted"].transform(lambda x: x.rolling(7).mean())

df["neg_sentiment_3d"] = df.groupby("Crypto")["neg_sentiment_weighted"].transform(lambda x: x.rolling(3).mean())
df["neg_sentiment_7d"] = df.groupby("Crypto")["neg_sentiment_weighted"].transform(lambda x: x.rolling(7).mean())



# Target variable: log return over the next 5 days
df["log_return_5d_future"] = np.log(df.groupby("Crypto")["price"].shift(-5) / df["price"])

# Drop last 5 days (since they have NaN targets)
df.dropna(inplace=True)



# Step 1: Get Bitcoin price for each day
btc_prices = df[df["Crypto"] == "BITCOIN"][["Date", "price"]].rename(columns={"price": "btc_price"})
df = df.merge(btc_prices, on="Date", how="left")

# Step 2: Compute price spread relative to Bitcoin
df["price_spread_btc"] = (df["price"] - df["btc_price"]) / df["btc_price"]

# Step 3: Compute market cap dominance
df["market_cap_total"] = df.groupby("Date")["market_cap"].transform("sum")
df["market_cap_dominance"] = df["market_cap"] / df["market_cap_total"]

# Step 4: Compute rolling correlation with Bitcoin
df["price_corr_btc"] = df.groupby("Crypto")["price"].transform(lambda x: x.rolling(7).corr(df["btc_price"]))

# Step 5: Compute relative trading volume
df["volume_total"] = df.groupby("Date")["volume"].transform("sum")
df["relative_volume"] = df["volume"] / df["volume_total"]

# Drop extra columns and rows with NaNs
df.drop(columns=["market_cap_total", "volume_total"], inplace=True)



# Z-Score for mean reversion (14-day window)
df["rolling_mean_14d"] = df.groupby("Crypto")["price"].transform(lambda x: x.rolling(14).mean())
df["rolling_std_14d"] = df.groupby("Crypto")["price"].transform(lambda x: x.rolling(14).std())
df["z_score_price"] = (df["price"] - df["rolling_mean_14d"]) / df["rolling_std_14d"]

# Price relative to recent highs/lows
df["pct_change_from_high_5d"] = (df["price"] - df.groupby("Crypto")["price"].transform(lambda x: x.rolling(5).max())) / df.groupby("Crypto")["price"].transform(lambda x: x.rolling(5).max())
df["pct_change_from_low_5d"] = (df["price"] - df.groupby("Crypto")["price"].transform(lambda x: x.rolling(5).min())) / df.groupby("Crypto")["price"].transform(lambda x: x.rolling(5).min())

df["pct_change_from_high_10d"] = (df["price"] - df.groupby("Crypto")["price"].transform(lambda x: x.rolling(10).max())) / df.groupby("Crypto")["price"].transform(lambda x: x.rolling(10).max())
df["pct_change_from_low_10d"] = (df["price"] - df.groupby("Crypto")["price"].transform(lambda x: x.rolling(10).min())) / df.groupby("Crypto")["price"].transform(lambda x: x.rolling(10).min())

# Drop temporary columns
df.drop(columns=["rolling_mean_14d", "rolling_std_14d"], inplace=True)




df = df.sort_values(['Date', 'Crypto'])
df = df.dropna()



# Identify features to use
feature_columns = [
    # Price and volume metrics
    'price', 'market_cap', 'volume', 'log_return_1d', 'log_return_5d',
    'volatility_3d', 'volatility_7d',
    
    # Weighted sentiment
    'pos_sentiment_weighted', 'neu_sentiment_weighted', 'neg_sentiment_weighted',
    'pos_sentiment_3d', 'pos_sentiment_7d', 'neu_sentiment_3d', 'neu_sentiment_7d',
    'neg_sentiment_3d', 'neg_sentiment_7d',
    
    # Market and technical indicators
    'z_score_price', 'pct_change_from_high_5d', 
    'pct_change_from_low_5d', 'pct_change_from_high_10d', 'pct_change_from_low_10d',
    
    # Calendar features
    'day_of_week', 'is_weekend'
]

# Target variable
target = 'log_return_5d_future'

# Check for high correlation between features
corr_matrix = df[feature_columns].corr()
high_corr_pairs = []
for i in range(len(corr_matrix.columns)):
    for j in range(i+1, len(corr_matrix.columns)):
        if abs(corr_matrix.iloc[i, j]) > 0.85:
            high_corr_pairs.append((corr_matrix.columns[i], corr_matrix.columns[j], corr_matrix.iloc[i, j]))

# Remove one feature from each highly correlated pair
features_to_remove = set()
for feat1, feat2, corr in high_corr_pairs:
    if feat1 not in features_to_remove and feat2 not in features_to_remove:
        features_to_remove.add(feat2)  # Remove the second feature arbitrarily

feature_columns = [f for f in feature_columns if f not in features_to_remove]



all_dates = sorted(df['Date'].unique())
all_cryptos = list(df['Crypto'].unique())
if 'USDC' not in all_cryptos:
    all_cryptos.append('USDC')


# Function to train models with past data
def train_models_for_date(df, feature_cols, target_col, current_date):
    """
    Train models for each crypto using only data available up to current_date
    """
    models = {}
    scalers = {}
    
    # Only use data up to (not including) the current date
    train_df = df[df['Date'] < current_date]
    
    for crypto in all_cryptos:
        # Skip USDC as we don't need to predict its returns (always 0)
        if crypto == 'USDC':
            continue
            
        crypto_train = train_df[train_df['Crypto'] == crypto]
        
        # Only train if we have sufficient data
        if len(crypto_train) >= 30:
            X_train = crypto_train[feature_cols]
            y_train = crypto_train[target_col]
            
            # Scale features
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            
            # Train model
            model = xgb.XGBRegressor(
                n_estimators=10,
                learning_rate=0.05,
                max_depth=6,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42
            )
            
            model.fit(X_train_scaled, y_train)
            
            models[crypto] = model
            scalers[crypto] = scaler
    
    return models, scalers


last_5_dates = df['Date'].sort_values().unique()[-5:]
current_date = pd.to_datetime(last_5_dates[0])

models, scalars = train_models_for_date(df, feature_columns, target, current_date)


current_data = df[df['Date'] > current_date]
output_rows = []
# current_data = df
for crypto in all_cryptos:
    # Skip USDC as we handle it differently
    if crypto == 'USDC':
        continue
    
    crypto_data = current_data[current_data['Crypto'] == crypto]
    X = crypto_data[feature_columns]
    X_scaled = scalars[crypto].transform(X)
    pred = models[crypto].predict(X_scaled)
    real = crypto_data[target]

    for date, prediction in zip(crypto_data["Date"].values, pred):
        output_rows.append([date, crypto, prediction])


output_df = pd.DataFrame(output_rows, columns=["Date", "Crypto", "Predicted"])

# Save to CSV file
output_df.to_csv("predicted_returns.csv", index=False)
