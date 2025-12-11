import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import type { AppKitNetwork } from '@reown/appkit/networks';
import {
  arbitrum,
  avalanche,
  base,
  optimism,
  polygon,
} from '@reown/appkit/networks';
import { cookieStorage, createStorage } from 'wagmi';

export const projectId = process.env
  .NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string;

if (!projectId) {
  throw new Error('Project ID is not defined');
}

export const networks = [
  arbitrum,
  // baseSepolia,
  base,
  polygon,
  optimism,
  avalanche,
] as [AppKitNetwork, ...AppKitNetwork[]];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ssr: true,
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;
