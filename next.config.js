/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            's2.coinmarketcap.com',
            'assets.coingecko.com'
        ],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 's2.coinmarketcap.com',
                pathname: '/static/img/coins/**',
            }
        ]
    },
    async redirects() {
        return [
            {
                source: '/home',
                destination: '/',
                permanent: true,
            },
            {
                source: '/index',
                destination: '/',
                permanent: true,
            }
        ];
    },
    async rewrites() {
        return {
            beforeFiles: [
                {
                    source: '/',
                    destination: '/home',
                }
            ]
        };
    },
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,POST' },
                    { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
                ]
            }
        ];
    },
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
        CMC_API_KEY: process.env.CMC_API_KEY || '',
        NODE_ENV: process.env.NODE_ENV || 'development'
    },
    poweredByHeader: false,
    compress: true,
    productionBrowserSourceMaps: true,
    reactStrictMode: true,
    swcMinify: true,
    output: 'standalone',
    experimental: {
        serverActions: true,
    }
};

module.exports = nextConfig;
