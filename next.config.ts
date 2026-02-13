import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/energy/2026',
        permanent: true,
      },
      {
        source: '/about',
        destination: '/energy/2026/about',
        permanent: true,
      },
      {
        source: '/accommodation',
        destination: '/energy/2026/accommodation',
        permanent: true,
      },
      {
        source: '/contact',
        destination: '/energy/2026/contact',
        permanent: true,
      },
      {
        source: '/fixtures',
        destination: '/energy/2026/fixtures',
        permanent: true,
      },
      {
        source: '/gallery',
        destination: '/energy/2026/gallery',
        permanent: true,
      },
      {
        source: '/instructions',
        destination: '/energy/2026/instructions',
        permanent: true,
      },
       {
        source: '/live',
        destination: '/energy/2026/live',
        permanent: true,
      },
      {
        source: '/medals',
        destination: '/energy/2026/medals',
        permanent: true,
      },
       {
        source: '/medal-tally',
        destination: '/energy/2026/medal-tally',
        permanent: true,
      },
      {
        source: '/players',
        destination: '/energy/2026/players',
        permanent: true,
      },
      {
        source: '/players/:id',
        destination: '/energy/2026/players/:id',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/energy/2026/registration',
        permanent: true,
      },
      {
        source: '/energy/2026/register',
        destination: '/energy/2026/registration',
        permanent: true,
      },
      {
        source: '/registration',
        destination: '/energy/2026/registration',
        permanent: true,
      },
      {
        source: '/rules',
        destination: '/energy/2026/rules',
        permanent: true,
      },
      {
        source: '/schedule',
        destination: '/energy/2026/schedule',
        permanent: true,
      },
      {
        source: '/sports',
        destination: '/energy/2026/sports',
        permanent: true,
      },
       {
        source: '/teams',
        destination: '/energy/2026/teams',
        permanent: true,
      },
      {
        source: '/teams/:id',
        destination: '/energy/2026/teams/:id',
        permanent: true,
      },
       {
        source: '/venues',
        destination: '/energy/2026/venues',
        permanent: true,
      },
      {
        source: '/registration/success',
        destination: '/energy/2026/registration/success',
        permanent: false, // These are part of a flow, so not permanent
      },
      {
        source: '/registration/failure',
        destination: '/energy/2026/registration/failure',
        permanent: false,
      },
       {
        source: '/registration/details',
        destination: '/energy/2026/registration/details',
        permanent: false,
      },
    ]
  },
  /* config options here */
  allowedDevOrigins: ['https://*.cloudworkstations.dev'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
