'use client';

import React, { useEffect, useState } from 'react';
import { Layout, Spin } from 'antd';
import { useRouter } from 'next/navigation';
import AppHeader from './AppHeader';

const { Content } = Layout;


interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  loading?: boolean;
}

export default function AuthenticatedLayout({ children, loading = false }: AuthenticatedLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const accessToken = localStorage.getItem('access_token');
        console.log("Access Token!!:", accessToken);
        setIsAuthenticated(!!accessToken);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: '16px',
          backgroundColor: '#e0dedeff',
        }}
      >
        <Spin size="large" />
        <div style={{ color: '#000000ff', fontSize: '14px' }}>
          {'Loading...'}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Content style={{ padding: '24px' }}>
        {children}
      </Content>
    </Layout>
  );
}
