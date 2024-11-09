export async function GET(request, { params }) {
    const baseUrl = 'https://shitcoinslist.com';
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memecoins`);
    const { data: categorizedCoins } = await response.json();
    const coins = Object.values(categorizedCoins).flat();

    const urls = [];

    // Add main pages
    urls.push(`${baseUrl}`);
    urls.push(`${baseUrl}/converter`);
    urls.push(`${baseUrl}/volume-hunter`);

    // Add coin pages
    coins.forEach(coin => {
        urls.push(`${baseUrl}/coin/${coin.slug}`);
        urls.push(`${baseUrl}/converter/${coin.symbol.toLowerCase()}/usd`);
        urls.push(`${baseUrl}/moon-calculator/${coin.symbol.toLowerCase()}`);
        urls.push(`${baseUrl}/volume-hunter/${coin.symbol.toLowerCase()}`);
    });

    return new Response(urls.join('\n'), {
        headers: {
            'Content-Type': 'text/plain',
        },
    });
} 