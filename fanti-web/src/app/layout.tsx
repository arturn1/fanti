import type { Metadata } from "next";
import "./globals.css";
import AntdProvider from "@/components/providers/antd-provider";
import { AuthProvider } from "@/hooks/useAuth";
import { App, Layout, Spin } from "antd";
import AppHeader from "@/components/AppHeader";
import React from "react";
import { DataSourceProvider } from "@/hooks/useDataSource";


export const metadata: Metadata = {
  title: "Fanti - Gerenciamento de Projetos Scrum",
  description: "Sistema completo de gerenciamento de projetos baseado em metodologia Scrum",
};

const { Content } = Layout;

// O layout precisa ser um Server Component, mas a autenticação é client-side.
// Por isso, o conteúdo principal é um Client Component dentro do AuthProvider.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <AntdProvider>
          <DataSourceProvider>
            <AuthProvider>
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', color: '#333', backgroundColor: 'white' }}>
                <AppHeader />
                {children}
              </div>
            </AuthProvider>
          </DataSourceProvider>
        </AntdProvider>
      </body>
    </html>
  );
}

