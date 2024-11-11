const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function generateSitemap() {
    const baseUrl = 'https://shitcoinslist.com';

    try {
        // Fetch coins from memecoins endpoint
        const response = await axios.get(`${baseUrl}/api/memecoins`);
        const allCoins = Object.values(response.data.data || {}).flat();

        // Static routes
        const staticRoutes = [
            '',
            '/new',
            '/tools',
            '/tools/usd-converter'
            
        ];

        // Keyword routes
        const keywordRoutes = [
            '/shitcoins',
            '/shitcoin-crypto',
            '/new-shitcoins',
            '/best-shitcoins',
            '/shitcoins-list',
            '/shitcoins-to-buy',
            '/shitcoin-trading',
            '/shitcoins-price',
            '/best-shitcoins-to-buy-in-2024'
        ];

        // Generate coin-specific routes
        const coinRoutes = allCoins.flatMap(coin => [
            `/tools/usd-converter/${coin.slug}`,
            `/converter/${coin.symbol.toLowerCase()}/usd`,
            `/converter/${coin.symbol.toLowerCase()}/eur`,
            `/converter/${coin.symbol.toLowerCase()}/gbp`
            
        ]);

        // Currency pairs for each coin
        const currencies = ['usd', 'eur', 'gbp', 'jpy', 'aud', 'cad', 'chf', 'cny'];
        const currencyRoutes = allCoins.flatMap(coin => 
            currencies.map(currency => `/converter/${coin.symbol.toLowerCase()}/${currency}`)
        );

        // Combine all routes
        const allRoutes = [
            ...staticRoutes.map(route => ({
                url: route,
                changefreq: 'daily',
                priority: route === '' ? '1.0' : '0.8'
            })),
            ...keywordRoutes.map(route => ({
                url: route,
                changefreq: 'daily',
                priority: '0.9'
            })),
            ...coinRoutes.map(route => ({
                url: route,
                changefreq: 'hourly',
                priority: '0.7'
            })),
            ...currencyRoutes.map(route => ({
                url: route,
                changefreq: 'hourly',
                priority: '0.7'
            }))
        ];

        // Generate sitemap XML
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${allRoutes.map(route => `
    <url>
        <loc>${baseUrl}${route.url}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>${route.changefreq}</changefreq>
        <priority>${route.priority}</priority>
    </url>`).join('')}
</urlset>`;

        // Write sitemap file
        const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
        fs.writeFileSync(sitemapPath, sitemap.trim());

        console.log('Sitemap generated successfully!');
        console.log(`Total URLs: ${allRoutes.length}`);
        console.log(`Static routes: ${staticRoutes.length}`);
        console.log(`Keyword routes: ${keywordRoutes.length}`);
        console.log(`Coin-specific routes: ${coinRoutes.length}`);
        console.log(`Currency routes: ${currencyRoutes.length}`);
        console.log(`Sitemap saved to: ${sitemapPath}`);

    } catch (error) {
        console.error('Error generating sitemap:', error);
        process.exit(1);
    }
}

generateSitemap();