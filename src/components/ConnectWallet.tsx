// src/components/ConnectWallet.tsx
import React from "react";
import { createAppKit, useAppKitAccount } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { AppKitNetwork, sepolia } from "@reown/appkit/networks";
import { useAppKit } from "@reown/appkit/react";
import { truncateString } from "../pages/History";

// 1. Get projectId
const projectId = "787920515535b0c17988d383680d9b0d";

// 2. Set the networks
const networks: [AppKitNetwork, ...AppKitNetwork[]] = [
  sepolia,
];

// 3. Create a metadata object - optional
const metadata = {
  name: "Uniswap Demo",
  description: "",
  url: "https://zimhook.github.io/uniswap_demo", // origin must match your domain & subdomain
  icons: [],
};

// 4. Create a AppKit instance
createAppKit({
  adapters: [new EthersAdapter()],
  networks,
  metadata,
  projectId,
});

const ConnectWallet: React.FC = () => {
  const { isConnected, address } = useAppKitAccount()
  const { open } = useAppKit();

  return (
    <div className="ml-auto">
      {!isConnected ? (
          <button
            onClick={() => open()}
            className="bg-blue-500 text-white p-2 rounded-md"
          >
            Connect Wallet
          </button>
      ) : (
        <div>
          <button
            onClick={() => open()}
            className="bg-gray-500 text-white p-2 rounded-md"
          >
            Sepolia: {truncateString(address)}
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;
