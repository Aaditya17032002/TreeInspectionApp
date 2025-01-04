'use client'

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { BottomNav } from '../layout/bottom-nav';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await instance.handleRedirectPromise();
        
        if (!isAuthenticated && pathname !== '/login') {
          router.push('/login');
        } else if (isAuthenticated && pathname === '/login') {
          router.push('/');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [isAuthenticated, router, pathname, instance]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  const showNavbar = isAuthenticated && pathname !== '/login';
  const showBottomNav = isAuthenticated && isMobile;  // Show bottom navigation only on mobile devices
  const showSideNav = isAuthenticated && !isMobile;   // Show side navigation only on non-mobile devices

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      {showBottomNav && <BottomNav isMobile={true} isOpen={true} setIsOpen={() => {}} />}
      {showSideNav && <BottomNav isMobile={false} isOpen={true} setIsOpen={() => {}} />}
    </div>
  );
}

