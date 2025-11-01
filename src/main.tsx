import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { EstimateProvider } from './context/EstimateContext';
import { AgentStoreProvider } from './state/AgentStore';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <EstimateProvider>
      <AgentStoreProvider>
        <App />
      </AgentStoreProvider>
    </EstimateProvider>
  </React.StrictMode>
);
