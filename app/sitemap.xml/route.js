import { getData } from '@/utils/getData';

export async function GET() {
    const { data } = await getData();
    const coins = data.memecoins;
    const baseUrl = 'https://shitcoinslist.com';

    const urls = [
        // Static pages
        baseUrl,
        `${baseUrl}/converter`,
        `${baseUrl}/tools/meme-battle`,
        `${baseUrl}/tools/moon-calculator`,
        `${baseUrl}/tools/usd-converter`,
        `${baseUrl}/tools/volume-hunter`,

        // Dynamic pages for each coin
        ...coins.flatMap(coin => [
            `${baseUrl}/coin/${coin.slug}`,
            `${baseUrl}/converter/${coin.symbol.toLowerCase()}/usd`,
            `${baseUrl}/moon-calculator/${coin.symbol.toLowerCase()}`,
            `${baseUrl}/volume-hunter/${coin.symbol.toLowerCase()}`
        ])
    ];

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
} 