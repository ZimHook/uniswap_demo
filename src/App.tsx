// src/App.tsx
import React from 'react';
import './App.css';
import ConnectWallet from './components/ConnectWallet';

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1 className="text-3xl font-bold">Connect Wallet Example</h1>
      </header>
      <main>
        <ConnectWallet />
      </main>
    </div>
  );
};

export default App;
