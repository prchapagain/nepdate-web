import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register the PWA service worker (virtual module provided by vite-plugin-pwa)
import { registerSW } from 'virtual:pwa-register';

registerSW({
  onNeedRefresh() {
    // Prompt user to reload when new version is available
    // Simple confirm for now; you can replace with a toast UI
    // `updateSW(true)` will skip waiting and activate the new SW
    if (confirm('A new version is available. Reload to update?')) {
      window.location.reload();
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
