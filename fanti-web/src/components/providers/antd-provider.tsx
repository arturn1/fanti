import { App, ConfigProvider } from 'antd';
import ptBR from 'antd/locale/pt_BR';

export default function AntdProvider({
  children,
}: {
  children: React.ReactNode;
}) {

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
