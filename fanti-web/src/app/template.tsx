'use client';

import React from 'react';
import { Layout, Spin } from 'antd';
import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/hooks/useAuth';

const { Content } = Layout;

interface TemplateProps {
  children: React.ReactNode;
  loading?: boolean;
}

export default function Template({ children, loading = false }: TemplateProps) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading || loading || !isAuthenticated) {
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
        </div>
    );
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

