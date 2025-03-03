
# CoolFi: What's cooler than being Cool?

Quick Start

1. Clone this repository
2. Configure environment variables (create a `.env` or `.env.local` file)

```bash
TWITTER_USERNAME=
TWITTER_PASSWORD=
TWITTER_EMAIL=
TWITTER_API_KEY=
TWITTER_API_SECRET_KEY=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_TOKEN_SECRET=
BITTE_API_KEY=
ACCOUNT_ID=

BITTE_API_URL="https://wallet.bitte.ai/api/v1"
NEAR_NETWORK="mainnet"
NEAR_RPC_URL="https://rpc.mainnet.near.org"
NEAR_SLIPPAGE=1
DEFUSE_CONTRACT_ID="intents.near"
COINGECKO_API_URL="https://api.coingecko.com/api/v3"
DEFUSE_RPC_URL="https://solver-relay-v2.chaindefuser.com/rpc"
FT_MINIMUM_STORAGE_BALANCE_LARGE="1250000000000000000000"
MAX_POLLING_TIME_MS=30000
POLLING_INTERVAL_MS=2000# Get your API key from https://key.bitte.ai

```

3. Install dependencies:

```bash
pnpm install
```

4. Start the development server:

```bash
pnpm run dev
```

API Endpoints are available at /.well-known/ai-plugin.json

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License
