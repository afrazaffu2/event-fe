"use client"
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/sidebar-nav';
import { Header } from '@/components/header';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useEffect } from 'react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();

  // Publicly accessible pages that don't require the sidebar layout
  const isNakedLayout = pathname?.startsWith('/events/') || pathname?.startsWith('/tickets/') || pathname?.startsWith('/activate/');

  if (isNakedLayout) {
    return <>{children}</>;
  }

  // Handle auth logic for all other pages (including /login and protected routes)
  useEffect(() => {
    if (auth.loading) return; // Wait for auth state to be determined

    // If user is on login page but already authenticated, redirect to dashboard
    if (auth.isAuthenticated && pathname === '/login') {
      router.push('/');
      return;
    }

    // If user is on a protected page and not authenticated, redirect to login
    if (!auth.isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [auth.loading, auth.isAuthenticated, pathname, router]);

  // If we are on the login page, just render it. The useEffect handles the redirect if needed.
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // For all protected routes, show loading state or the layout
  if (auth.loading || !auth.isAuthenticated) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarNav />
      </Sidebar>
      <SidebarInset>
        <Header />
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
