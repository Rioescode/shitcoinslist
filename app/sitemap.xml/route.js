import { getData } from '@/utils/getData';

export async function GET() {
    try {
        const baseUrl = 'https://shitcoinslist.com';
        
        // Use static data directly to avoid API calls during build
        const staticUrls = [
            '',
            '/converter',
            '/tools/meme-battle',
            '/tools/moon-calculator',
            '/tools/usd-converter',
            '/tools/volume-hunter'
        ];

        // Static coins for build time
        const staticCoins = [
            { symbol: 'doge', slug: 'dogecoin' },
            { symbol: 'shib', slug: 'shiba-inu' },
            { symbol: 'pepe', slug: 'pepe' }
        ];

        const urls = [
            // Add static pages
            ...staticUrls.map(path => `${baseUrl}${path}`),

            // Add dynamic pages for each coin
            ...staticCoins.flatMap(coin => [
                `${baseUrl}/coin/${coin.slug}`,
                `${baseUrl}/converter/${coin.symbol}/usd`,
                `${baseUrl}/moon-calculator/${coin.symbol}`,
                `${baseUrl}/volume-hunter/${coin.symbol}`
            ])
        ];

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
            <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                ${urls.map(url => `
                    <url>
                        <loc>${url}</loc>
                        <changefreq>daily</changefreq>
                        <priority>0.7</priority>
                        <lastmod>${new Date().toISOString()}</lastmod>
                    </url>
                `).join('')}
            </urlset>`;

        return new Response(sitemap, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600'
            },
        });

    } catch (error) {
        console.error('Error generating sitemap:', error);
        return new Response('Error generating sitemap', { status: 500 });
    }
} 