"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, WagmiProvider } from "wagmi";
import { metaMask } from "wagmi/connectors";
import { holesky } from "wagmi/chains";
import { http } from "viem";

const config = createConfig({
  chains: [holesky],
  connectors: [metaMask()],
  transports: {
    [holesky.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>{children}</WagmiProvider>
    </QueryClientProvider>
  );
}
