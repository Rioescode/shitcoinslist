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
                source: '/',
                destination: '/home',
                permanent: true,
            },
        ];
    },
    async rewrites() {
        return [
            {
                source: '/',
                destination: '/home',
            },
        ];
    },
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS' },
                    { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
                    { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' }
                ]
            }
        ];
    },
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || ''
    },
    poweredByHeader: false,
    compress: true,
    productionBrowserSourceMaps: true,
    reactStrictMode: true,
    swcMinify: true,
    trailingSlash: false,
    basePath: '',
};

module.exports = nextConfig;
