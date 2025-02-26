// src/components/ConnectWallet.tsx
import React, { useState } from 'react';
import { ethers } from 'ethers';
import WalletConnectProvider from '@walletconnect/web3-provider';

interface State {
  provider: ethers.Provider | null;
  account: string | null;
  network: string | null;
}

const ConnectWallet: React.FC = () => {
  const [state, setState] = useState<State>({
    provider: null,
    account: null,
    network: null,
  });

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const ethProvider = new ethers.BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        const accounts = await ethProvider.listAccounts();
        const network = await ethProvider.getNetwork();

        setState({
          provider: ethProvider,
          account: accounts[0].address,
          network: network.name,
        });
      } catch (error) {
        console.error('MetaMask connection failed:', error);
      }
    } else {
      alert('MetaMask is not installed!');
    }
  };

  const connectWalletConnect = async () => {
    const provider = new WalletConnectProvider({
      infuraId: '787920515535b0c17988d383680d9b0d', // You need to set up an Infura account to get this ID.
    });

    try {
      await provider.enable();
      const ethProvider = new ethers.BrowserProvider(provider);
      const accounts = await ethProvider.listAccounts();
      const network = await ethProvider.getNetwork();

      setState({
        provider: ethProvider,
        account: accounts[0].address,
        network: network.name,
      });
    } catch (error) {
      console.error('WalletConnect connection failed:', error);
    }
  };

  const disconnectWallet = () => {
    setState({
      provider: null,
      account: null,
      network: null,
    });
  };

  return (
    <div className="flex flex-col items-center p-4">
      {!state.account ? (
        <div className="space-x-4">
          <button
            onClick={connectMetaMask}
            className="bg-blue-500 text-white p-2 rounded-md"
          >
            Connect MetaMask
          </button>
          <button
            onClick={connectWalletConnect}
            className="bg-green-500 text-white p-2 rounded-md"
          >
            Connect WalletConnect
          </button>
        </div>
      ) : (
        <div>
          <h3>Connected</h3>
          <p>Account: {state.account}</p>
          <p>Network: {state.network}</p>
          <button
            onClick={disconnectWallet}
            className="bg-red-500 text-white p-2 rounded-md mt-4"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;
