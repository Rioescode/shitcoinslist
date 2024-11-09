/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            's2.coinmarketcap.com',  // For CoinMarketCap logos
            'assets.coingecko.com',  // Backup source for logos
            'localhost'
        ],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 's2.coinmarketcap.com',
                pathname: '/static/img/coins/**',
            }
        ]
    },
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS' },
                    { key: 'Access-Control-Allow-Headers', value: 'Content-Type' }
                ]
            }
        ];
    }
};

module.exports = nextConfig;
