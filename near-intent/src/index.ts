import { walletProvider } from "./providers/wallet";
import "dotenv/config";
import { transferNEAR } from "./actions/transfer";
import { swapToken } from "./actions/swap";
import { crossChainSwap, withdrawFromDefuse } from "./actions/crossChainSwap";
import { CrossChainSwapParams, CrossChainSwapAndWithdrawParams } from "./types/intents";
import { settings } from "./utils/environment";
import { getTokenPriceUSD } from "./providers/coingeckoProvider";
import { WalletProvider } from "./providers/wallet";

// (async () => {
//     const result = await walletProvider.get();
//     console.log("Wallet Provider Response:", result);

//     const cross_chain_params : CrossChainSwapParams = {
//         exact_amount_in: "0.01",
//         defuse_asset_identifier_in: "NEAR",
//         defuse_asset_identifier_out: "BTC",
//         network: "near"
//     };

//     const cross_chain_withdraw_params : CrossChainSwapAndWithdrawParams = {
//         exact_amount_in: "0.01",
//         defuse_asset_identifier_in: "",
//         defuse_asset_identifier_out: "NEAR",
//         destination_address: settings.accountId,
//         network: "near"
//     };

//     console.log(await crossChainSwap(cross_chain_params));
//     // console.log(await withdrawFromDefuse(cross_chain_withdraw_params));

//     // console.log(await getCoinIds());
//     // console.log(await getTokenPriceUSD("ethereum"));


//     // console.log(await swapToken("wrap.testnet", "ref.fakes.testnet", "0.1"));
//     // console.log(await transferNEAR("law1912.testnet", "1"));
// })();


export { crossChainSwap, withdrawFromDefuse, WalletProvider };