import { createConfig, http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { getDefaultConfig } from "connectkit";

export const config = createConfig(
  getDefaultConfig({
    // Your WalletConnect Project ID
    walletConnectProjectId: "DEFAULT_PROJECT_ID",

    appName: "Base Builder Hub",

    // Required chains
    chains: [base, baseSepolia],

    // Required API Keys
    // alchemyId: process.env.ALCHEMY_ID, // or infuraId
    // infuraId: process.env.INFURA_ID, // or alchemyId

    transports: {
      [base.id]: http(),
      [baseSepolia.id]: http(),
    },
  })
);
