'use client'

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useMsal } from "@azure/msal-react";
import { BottomNav } from '../layout/bottom-nav';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { instance, accounts } = useMsal();
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isSideNavOpen, setIsSideNavOpen] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await instance.handleRedirectPromise();
        const isAuthenticated = accounts.length > 0;

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
  }, [router, pathname, instance, accounts]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  const isAuthenticated = accounts.length > 0;
  const showNavbar = isAuthenticated && pathname !== '/login';
  const showBottomNav = showNavbar && isMobile;
  const showSideNav = showNavbar && !isMobile;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <main className={`flex-1 overflow-y-auto ${showSideNav ? 'md:ml-20 lg:ml-64' : ''}`}>
        {children}
      </main>
      {showBottomNav && <BottomNav isMobile={true} isOpen={true} setIsOpen={() => {}} />}
      {showSideNav && (
        <BottomNav
          isMobile={false}
          isOpen={isSideNavOpen}
          setIsOpen={setIsSideNavOpen}
        />
      )}
    </div>
  );
}

