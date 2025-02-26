import React from 'react';
import ConnectWallet from './ConnectWallet';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 text-white p-4 flex items-center gap-4">
      <nav className='flex items-center gap-4 mx-auto'>
      <Link to="/balance" className="hover:text-blue-400 px-4 py-2 rounded-md hover:bg-gray-700">
          tokens
        </Link>
        <Link to="/trade" className="hover:text-blue-400 px-4 py-2 rounded-md hover:bg-gray-700">
          交易
        </Link>
        <Link to="/liquidity" className="hover:text-blue-400 px-4 py-2 rounded-md hover:bg-gray-700">
          流动性
        </Link>
        <Link to="/history" className="hover:text-blue-400 px-4 py-2 rounded-md hover:bg-gray-700">
          历史
        </Link>
      </nav>
      <ConnectWallet />
    </header>
  );
};

export default Header;
