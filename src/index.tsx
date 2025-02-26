import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Router from './router';
import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Router />
    <Toaster />
  </React.StrictMode>
);