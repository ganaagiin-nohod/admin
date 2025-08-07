import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';
import { AUTH_CONFIG } from './src/constants/auth';

const baseConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  env: {
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: AUTH_CONFIG.signInUrl,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: AUTH_CONFIG.signUpUrl,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: AUTH_CONFIG.afterSignInUrl,
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: AUTH_CONFIG.afterSignUpUrl,
    SPOTIFY_CLIENT_ID: AUTH_CONFIG.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: AUTH_CONFIG.SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REDIRECT_URI: AUTH_CONFIG.SPOTIFY_REDIRECT_URI,
    CLOUDINARY_CLOUD_NAME: AUTH_CONFIG.CLOUDINARY_CLOUD_NAME
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: ''
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: ''
      }
    ]
  },
  transpilePackages: ['geist'],
  experimental: {
    workerThreads: false,
    webpackBuildWorker: false
  },

  webpack: (config, { dev, isServer }) => {
    if (!dev) {
      config.cache = false;
      config.parallelism = 1;
    }

    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 200000,
          cacheGroups: {
            default: {
              minChunks: 1,
              priority: -20,
              reuseExistingChunk: true
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
              maxSize: 200000
            }
          }
        }
      };
    }
    return config;
  }
};

let configWithPlugins = baseConfig;

// Temporarily disable Sentry to reduce memory usage during build
if (false && !process.env.NEXT_PUBLIC_SENTRY_DISABLED) {
  configWithPlugins = withSentryConfig(configWithPlugins, {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options
    // FIXME: Add your Sentry organization and project names
    org: process.env.NEXT_PUBLIC_SENTRY_ORG,
    project: process.env.NEXT_PUBLIC_SENTRY_PROJECT,
    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    reactComponentAnnotation: {
      enabled: true
    },

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: '/monitoring',

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Disable Sentry telemetry
    telemetry: false
  });
}

const nextConfig = configWithPlugins;
export default nextConfig;
