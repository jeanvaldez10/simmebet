/* eslint-disable  @typescript-eslint/no-explicit-any */
"use client";

import React, { type ReactNode } from "react";
import { createAppKit } from "@reown/appkit/react";
import { wagmiAdapter, projectId, networks } from "@/config/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, type Config } from "wagmi";

// Set up queryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 30000,
    },
  },
});

const metadata = {
  name: "bluff",
  description: "AppKit Example",
  url: "https://reown.com/appkit", // origin must match your domain & subdomain
  icons: ["https://assets.reown.com/reown-profile-pic.png"],
};

// Create the modal
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: networks,
  defaultNetwork: networks[0],
  metadata: metadata,
  features: {
    send: false,
    swaps: false,
    onramp: false,
  
    analytics: false,
    legalCheckbox: false,
    connectMethodsOrder: ['wallet']
  },
});

function ContextProvider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState: any;
}) {
  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export default ContextProvider;
