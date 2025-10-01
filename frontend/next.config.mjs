/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets-jane-cac1-16.janeapp.net',
        port: '',
        pathname: '/pub/**',
      },
      {
        protocol: 'https',
        hostname: 'www.yourtechstory.com',
        port: '',
        pathname: '/wp-content/**',
      },
      {
        protocol: 'https',
        hostname: 'tse4.mm.bing.net',
        port: '',
        pathname: '/th/**',
      },
      {
        protocol: 'https',
        hostname: 'mundotech.news',
        port: '',
        pathname: '/wp-content/**',
      },
    ],
  },
  serverExternalPackages: ['@supabase/supabase-js'],
}

export default nextConfig