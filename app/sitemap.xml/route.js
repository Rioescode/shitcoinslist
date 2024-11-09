import { fetchMemeCoins } from '@/utils/fetchData';

export async function GET() {
    try {
        const { data: categorizedCoins } = await fetchMemeCoins();
        const coins = Object.values(categorizedCoins).flat();
        
        const baseUrl = 'https://shitcoinslist.com';
        const urls = [];

        // Add static pages
        urls.push(`${baseUrl}`);
        urls.push(`${baseUrl}/converter`);
        urls.push(`${baseUrl}/volume-hunter`);

        // Add dynamic pages
        coins.forEach(coin => {
            urls.push(`${baseUrl}/coin/${coin.slug}`);
            urls.push(`${baseUrl}/converter/${coin.symbol.toLowerCase()}/usd`);
            urls.push(`${baseUrl}/moon-calculator/${coin.symbol.toLowerCase()}`);
            urls.push(`${baseUrl}/volume-hunter/${coin.symbol.toLowerCase()}`);
        });

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
            <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                ${urls.map(url => `
                    <url>
                        <loc>${url}</loc>
                        <changefreq>daily</changefreq>
                        <priority>0.7</priority>
                    </url>
                `).join('')}
            </urlset>`;

        return new Response(sitemap, {
            headers: {
                'Content-Type': 'application/xml',
            },
        });
    } catch (error) {
        console.error('Error generating sitemap:', error);
        return new Response('Error generating sitemap', { status: 500 });
    }
} 