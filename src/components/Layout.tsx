import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <main className="container mx-auto p-4 w-screen overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
