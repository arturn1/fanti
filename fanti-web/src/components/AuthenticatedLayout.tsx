'use client';

import React, { useEffect } from 'react';
import { Layout, Spin } from 'antd';
import { useRouter } from 'next/navigation';
import AppHeader from './AppHeader';
import { useAuth } from '../hooks/useAuth';

const { Content } = Layout;


interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  loading?: boolean;
}


export default function AuthenticatedLayout({ children, loading = false }: AuthenticatedLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();

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
