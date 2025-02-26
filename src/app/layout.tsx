"use client";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import "./global.css"; // Ensure this is correctly imported
import { BitteWalletContextProvider } from "@bitte-ai/react";

const BitteWalletSetup = {
  network: "mainnet",
  callbackUrl: typeof window !== "undefined" ? window.location.origin : "",
  contractAddress: "",
};

type WalletProviderProps = {
  children: React.ReactNode;
};

const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  return (
    <BitteWalletContextProvider {...BitteWalletSetup}>
      {children}
    </BitteWalletContextProvider>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <head>
        <style>
          {`
            ::-webkit-scrollbar { display: none; }
            html, body { scrollbar-width: none; -ms-overflow-style: none; }
          `}
        </style>
        </head>
      <body>
      <AppRouterCacheProvider>
            <WalletProvider>
                {children}
            </WalletProvider>
      </AppRouterCacheProvider>
      </body>
    </html>
  );
}