import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  typescript: {
    // Durante o build, ignora erros de TypeScript se necessário
    ignoreBuildErrors: false,
  },
  eslint: {
    // Durante o build, ignora erros de ESLint se necessário
    ignoreDuringBuilds: false,
  },

  webpack: (config, { isServer }) => {
    // Configurações específicas do webpack se necessário
    return config;
  },
};

export default nextConfig;
