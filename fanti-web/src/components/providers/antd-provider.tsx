'use client';

import { ConfigProvider, App } from 'antd';
import ptBR from 'antd/locale/pt_BR';
import { useEffect } from 'react';

export default function AntdProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Suprimir warnings específicos do Ant Design sobre compatibilidade com React 19
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('[antd: compatible]')) {
        return; // Não mostrar este warning específico
      }
      originalWarn.apply(console, args);
    };

    return () => {
      console.warn = originalWarn;
    };
  }, []);

  return (
    <ConfigProvider
      locale={ptBR}
      theme={{
        token: {
          colorPrimary: '#1677ff',
        },
      }}
    >
      <App>
        {children}
      </App>
    </ConfigProvider>
  );
}
