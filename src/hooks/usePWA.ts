import { useState, useEffect } from 'react';
import { registerSW } from 'virtual:pwa-register';

export const usePWA = () => {
  const [isStandalone, setIsStandalone] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(
    () => localStorage.getItem('pwa_installed') === 'true'
  );
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Register SW
  useEffect(() => {
    registerSW({ immediate: true });
  }, []);

  // Detect standalone, install events
  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone;
    setIsStandalone(!!standalone);

    if (standalone) {
      setIsInstalled(true);
      return;
    }

    const handleAppInstalled = () => {
      localStorage.setItem('pwa_installed', 'true');
      setIsInstalled(true);
      setCanInstall(false);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    if ('getInstalledRelatedApps' in navigator) {
      (navigator as any).getInstalledRelatedApps().then((apps: any[]) => {
        if (apps.length > 0) {
          if (localStorage.getItem('pwa_installed') !== 'true') {
            localStorage.setItem('pwa_installed', 'true');
          }
          setIsInstalled(true);
        }
      });
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      localStorage.removeItem('pwa_installed');
      setIsInstalled(false);
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setCanInstall(false);
    }
  };

  return { isStandalone, canInstall, isInstalled, deferredPrompt, handleInstallClick };
};