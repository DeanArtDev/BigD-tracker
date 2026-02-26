import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { GlobalErrorBoundary } from './components/global-error-boundary';
import { NetworkErrorNotifier } from './components/network-error-notifier';
import { router } from './router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <NetworkErrorNotifier />
      <RouterProvider router={router} />
    </GlobalErrorBoundary>
  </StrictMode>,
);
