import { fetchMemeCoins } from '@/utils/fetchData';

export async function GET() {
    try {
        const { data: categorizedCoins } = await fetchMemeCoins();
        const coins = Object.values(categorizedCoins).flat();
        
        const baseUrl = 'https://shitcoinslist.com';
        
        const feed = `<?xml version="1.0" encoding="UTF-8"?>
            <rss version="2.0">
                <channel>
                    <title>ShitcoinsList.com - Meme Coin Tracker</title>
                    <link>${baseUrl}</link>
                    <description>Track and analyze meme coins with real-time data and tools</description>
                    ${coins.map(coin => `
                        <item>
                            <title>${coin.name} (${coin.symbol})</title>
                            <link>${baseUrl}/coin/${coin.slug}</link>
                            <description>Track ${coin.name} price, volume, and market data</description>
                            <pubDate>${new Date().toUTCString()}</pubDate>
                        </item>
                    `).join('')}
                </channel>
            </rss>`;

        return new Response(feed, {
            headers: {
                'Content-Type': 'application/xml',
            },
        });
    } catch (error) {
        console.error('Error generating feed:', error);
        return new Response('Error generating feed', { status: 500 });
    }
} 