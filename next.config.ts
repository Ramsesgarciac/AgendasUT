import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/:path*',
      },
    ];
  },

  // Optimize bundle size and loading
  experimental: {
    optimizePackageImports: ['@heroui/react', '@heroui/theme', '@radix-ui/react-dialog', '@radix-ui/react-tabs'],
  },

  // Enable webpack optimizations for better code splitting
  webpack: (config, { dev }) => {
    // Optimize chunks for better loading performance
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test: /[\\/]node_modules[\\/](!next[\\/])(?!@heroui[\\/])(?!@radix-ui[\\/])/,
            name: 'lib',
            priority: 30,
            chunks: 'all',
          },
          radix: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            name: 'radix-ui',
            chunks: 'all',
            priority: 20,
          },
          heroui: {
            test: /[\\/]node_modules[\\/]@heroui[\\/]/,
            name: 'heroui',
            chunks: 'all',
            priority: 20,
          },
        },
      };
    }

    return config;
  },
};

export default nextConfig;
