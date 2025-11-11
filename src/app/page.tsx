'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized, _hasHydrated } = useAuthStore();

  useEffect(() => {
    // Wait for hydration to complete before redirecting
    if (!_hasHydrated) return;

    if (isInitialized) {
      if (isAuthenticated) {
        router.push('/genel');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isInitialized, _hasHydrated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );
}
