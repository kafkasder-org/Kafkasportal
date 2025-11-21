/**
 * Service Worker Registration Component
 * Handles PWA installation and updates
 */

'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import logger from '@/lib/logger';

export function ServiceWorkerRegister() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [_updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Only register service worker in production and on client
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') {
      return;
    }

    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      logger.warn('Service Worker not supported');
      return;
    }

    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });

        setRegistration(reg);
        logger.info('Service Worker registered successfully');

        // Check for updates every hour
        setInterval(
          () => {
            reg.update();
          },
          60 * 60 * 1000
        );

        // Listen for service worker updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker available
                setUpdateAvailable(true);
                toast.info('Yeni güncelleme mevcut', {
                  description: 'Güncellemeleri uygulamak için sayfayı yenileyin.',
                  duration: 10000,
                  action: {
                    label: 'Yenile',
                    onClick: () => {
                      newWorker.postMessage({ type: 'SKIP_WAITING' });
                      window.location.reload();
                    },
                  },
                });
              }
            });
          }
        });

        // Listen for controlling service worker changes
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          logger.info('Service Worker controller changed');
        });
      } catch (error) {
        logger.error('Service Worker registration failed', { error });
      }
    };

    registerSW();
  }, []);

  // Show install prompt
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let deferredPrompt: BeforeInstallPromptEvent | null = null;

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;

      // Show custom install button/toast
      toast.info("Kafkasder'i ana ekrana ekleyin", {
        description: 'Daha hızlı erişim için uygulamayı yükleyin',
        duration: 15000,
        action: {
          label: 'Yükle',
          onClick: async () => {
            if (deferredPrompt) {
              deferredPrompt.prompt();
              const { outcome } = await deferredPrompt.userChoice;
              logger.info('PWA install prompt outcome:', { outcome });
              deferredPrompt = null;
            }
          },
        },
      });
    };

    const handleAppInstalled = () => {
      logger.info('PWA was installed');
      toast.success('Uygulama başarıyla yüklendi!');
      deferredPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      toast.success('İnternet bağlantısı yeniden kuruldu', {
        icon: '🌐',
        duration: 3000,
      });

      // Sync offline data if service worker supports it
      if (registration && 'sync' in registration) {
        (registration as any).sync.register('sync-offline-data').catch((error: any) => {
          logger.error('Background sync registration failed', { error });
        });
      }
    };

    const handleOffline = () => {
      toast.warning('İnternet bağlantısı kesildi', {
        description: 'Offline modunda çalışıyorsunuz',
        icon: '📡',
        duration: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [registration]);

  return null; // This component doesn't render anything
}

// Type definition for beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}
