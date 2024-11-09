export async function GET() {
    const baseUrl = 'https://shitcoinslist.com';
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memecoins`);
    const { data: categorizedCoins } = await response.json();
    const coins = Object.values(categorizedCoins).flat();

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
} 