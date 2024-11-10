import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const API_KEY = process.env.CMC_API_KEY;
        const url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest';

        // Create proper URL with query parameters
        const urlWithParams = new URL(url);
        urlWithParams.searchParams.append('start', '1');
        urlWithParams.searchParams.append('limit', '500');
        urlWithParams.searchParams.append('sort', 'date_added');
        urlWithParams.searchParams.append('sort_dir', 'desc');

        const response = await fetch(urlWithParams, {
            headers: {
                'X-CMC_PRO_API_KEY': API_KEY,
                'Accept': 'application/json'
            },
            next: { revalidate: 300 }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data from CoinMarketCap');
        }

        const data = await response.json();

        // Expanded keywords list for better meme coin detection
        const memeKeywords = [
            'doge', 'shib', 'pepe', 'wif', 'bonk', 'cat', 'floki', 'inu', 
            'elon', 'moon', 'safe', 'baby', 'meme', 'wojak', 'chad', 'shit',
            'cum', 'cock', 'penis', 'pussy', 'milf', 'ceo', 'karen', 'trump',
            'biden', 'jesus', 'god', 'monkey', 'ape', 'pig', 'cow', 'frog',
            'rat', 'bird', 'fish', 'santa', 'easter', 'valentine', 'pepe',
            'wojak', 'chad', 'virgin', 'based', 'kek', 'wagmi', 'fud', 'fomo'
        ];

        // Get date 6 months ago
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        console.log('Total coins fetched:', data.data.length); // Debug log

        // Filter and categorize coins
        const latestMemeCoins = data.data
            .filter(coin => {
                const name = (coin.name || '').toLowerCase();
                const symbol = (coin.symbol || '').toLowerCase();
                const tags = coin.tags?.map(tag => tag.toLowerCase()) || [];

                // Check if it matches any meme keywords
                const isMemeCoin = 
                    memeKeywords.some(keyword => 
                        name.includes(keyword) || 
                        symbol.includes(keyword)
                    ) ||
                    tags.some(tag => 
                        tag.includes('meme') || 
                        tag.includes('joke') || 
                        tag.includes('community')
                    );

                // Check if within 6 months
                const coinDate = new Date(coin.date_added);
                const isRecent = coinDate > sixMonthsAgo;

                return isMemeCoin && isRecent;
            });

        console.log('Filtered meme coins:', latestMemeCoins.length); // Debug log

        // Format coins
        const formattedCoins = latestMemeCoins.map(coin => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            slug: coin.slug,
            date_added: coin.date_added,
            price: coin.quote.USD.price,
            market_cap: coin.quote.USD.market_cap,
            volume_24h: coin.quote.USD.volume_24h,
            percent_change_24h: coin.quote.USD.percent_change_24h,
            percent_change_7d: coin.quote.USD.percent_change_7d,
            percent_change_30d: coin.quote.USD.percent_change_30d,
            tags: coin.tags,
            logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`,
            rank: coin.cmc_rank
        }));

        return NextResponse.json({
            status: 'success',
            data: formattedCoins,
            total_count: formattedCoins.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error fetching new meme coins:', error);
        return NextResponse.json({
            status: 'error',
            message: error.message
        }, { status: 500 });
    }
}

// Helper function to calculate potential score
function calculatePotentialScore(coin) {
    let score = 0;
    
    // Volume/Market Cap ratio (0-30 points)
    const volumeRatio = coin.quote.USD.volume_24h / coin.quote.USD.market_cap;
    score += Math.min(30, volumeRatio * 100);
    
    // Price movement (0-30 points)
    const priceChange = Math.abs(coin.quote.USD.percent_change_24h);
    score += Math.min(30, priceChange / 2);
    
    // Market cap size (0-20 points)
    if (coin.quote.USD.market_cap < 1000000) score += 20; // < $1M
    else if (coin.quote.USD.market_cap < 10000000) score += 15; // < $10M
    else if (coin.quote.USD.market_cap < 100000000) score += 10; // < $100M
    
    // Social signals (0-20 points)
    if (coin.tags?.includes('meme')) score += 10;
    if (coin.tags?.some(tag => tag.includes('community'))) score += 10;
    
    return Math.min(100, score);
} 