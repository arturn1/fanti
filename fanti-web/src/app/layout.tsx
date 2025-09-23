import type { Metadata } from "next";
import "./globals.css";
import AntdProvider from "@/components/providers/antd-provider";
import { AuthProvider } from "@/hooks/useAuth";

export const metadata: Metadata = {
  title: "Fanti - Gerenciamento de Projetos Scrum",
  description: "Sistema completo de gerenciamento de projetos baseado em metodologia Scrum",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <AntdProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </AntdProvider>
      </body>
    </html>
  );
}
