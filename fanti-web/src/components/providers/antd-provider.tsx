'use client';

import { App, ConfigProvider } from 'antd';
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
        components: {
          Carousel: {
            arrowSize: 14,
            arrowOffset:-15,
            dotOffset: -8,
            dotHeight: 6,
            dotWidth: 6,
          },
        },
      }}
    >
      <App>
        {children}
      </App>
    </ConfigProvider>
  );
}
