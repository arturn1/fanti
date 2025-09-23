'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { useAuth } from '@/hooks/useAuth';

interface TemplateProps {
  children: React.ReactNode;
}

export default function Template({ children }: TemplateProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Verificar autenticação apenas se não estiver carregando
    if (!isLoading) {
      if (!isAuthenticated && pathname !== '/login') {
        console.log("Not Authenticated! Redirecting to login...", isAuthenticated);
        // Se não está autenticado e não está na página de login, redirecionar
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (isAuthenticated && pathname === '/login') {
        // Se está autenticado e está na página de login, redirecionar para home
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect') || '/';
        router.replace(redirect);
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Se está na página de login, não usar o AuthenticatedLayout
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <AuthenticatedLayout>
      {children}
    </AuthenticatedLayout>
  );
}
