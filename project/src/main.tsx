// Example usage of environment variables
const apiUrl = import.meta.env.VITE_API_URL;
const analyticsId = import.meta.env.VITE_ANALYTICS_ID;

console.log('API URL:', apiUrl);
console.log('Analytics ID:', analyticsId);

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './ErrorBoundary';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App apiUrl={apiUrl} analyticsId={analyticsId} />
    </ErrorBoundary>
  </StrictMode>
);
