import { NextResponse } from 'next/server';
import axios from 'axios';

// In-memory cache with multiple layers
let cachedData = null;
let lastFetchTime = null;

const CACHE_DURATIONS = {
    HIGH_CAP: 15 * 60 * 1000,    // 15 minutes for top 20 coins
    MID_CAP: 30 * 60 * 1000,     // 30 minutes for mid-cap coins
    LOW_CAP: 60 * 60 * 1000      // 1 hour for low-cap coins
};

const categorizeCoin = (coin) => {
    const marketCap = coin.quote?.USD?.market_cap || 0;
    const daysSinceListing = coin.date_added ? 
        Math.floor((Date.now() - new Date(coin.date_added).getTime()) / (1000 * 60 * 60 * 24)) : 0;

    if (marketCap >= 1000000000) return 'top'; // > $1B
    if (marketCap >= 100000000) return 'mid';  // > $100M
    if (daysSinceListing <= 30) return 'new';  // Listed in last 30 days
    if (coin.quote?.USD?.volume_24h > marketCap) return 'trending';
    return 'other';
};

export async function GET(req) {
    try {
        // Get host from request
        const host = req.headers.get('host');
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const baseUrl = `${protocol}://${host}`;

        console.log('API Request from:', baseUrl);
        
        const CMC_API_KEY = process.env.CMC_API_KEY;
        console.log('API Key available:', !!CMC_API_KEY);
        
        if (!CMC_API_KEY) {
            return NextResponse.json(
                { error: 'CoinMarketCap API key is not configured' }, 
                { status: 500 }
            );
        }

        const now = Date.now();

        if (cachedData && lastFetchTime && (now - lastFetchTime) < CACHE_DURATIONS.HIGH_CAP) {
            return NextResponse.json({
                data: cachedData,
                cached: true,
                nextUpdate: new Date(lastFetchTime + CACHE_DURATIONS.HIGH_CAP)
            });
        }

        console.log('Fetching data from CoinMarketCap...');

        const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
            headers: {
                'X-CMC_PRO_API_KEY': CMC_API_KEY,
                'Accept': 'application/json'
            },
            params: {
                limit: 5000,
                convert: 'USD'
            },
            timeout: 10000
        });

        console.log('API Response:', response.status, response.statusText);

        if (!response.data?.data) {
            throw new Error('Invalid response from CoinMarketCap API');
        }

        const memeKeywords = ['meme', 'dog', 'shib', 'inu', 'pepe', 'wojak', 'chad', 'elon', 'doge', 'floki', 'moon', 'safe', 'baby', 'rocket', 'mars'];
        
        const coins = response.data.data
            .filter(coin => {
                const nameAndSymbol = (coin.name + coin.symbol).toLowerCase();
                return memeKeywords.some(keyword => nameAndSymbol.includes(keyword.toLowerCase())) ||
                       coin.tags?.some(tag => tag.toLowerCase().includes('meme'));
            })
            .map(coin => ({
                id: coin.id,
                name: coin.name || 'Unknown',
                symbol: coin.symbol || '',
                slug: coin.slug || '',
                price: coin.quote?.USD?.price || 0,
                percent_change_24h: coin.quote?.USD?.percent_change_24h || 0,
                percent_change_7d: coin.quote?.USD?.percent_change_7d || 0,
                percent_change_30d: coin.quote?.USD?.percent_change_30d || 0,
                market_cap: coin.quote?.USD?.market_cap || 0,
                volume_24h: coin.quote?.USD?.volume_24h || 0,
                rank: coin.cmc_rank || 999999,
                logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`,
                tags: coin.tags || [],
                last_updated: coin.quote?.USD?.last_updated,
                date_added: coin.date_added,
                volume_change_24h: coin.quote?.USD?.volume_change_24h || 0,
                max_supply: coin.max_supply || 0,
                circulating_supply: coin.circulating_supply || 0,
                total_supply: coin.total_supply || 0,
                platform: coin.platform || null,
                category: coin.category || 'Meme'
            }))
            .filter(coin => coin.price > 0);

        console.log('Coins found:', coins.length);

        const categorizedCoins = {
            top: coins.filter(coin => coin.market_cap >= 1000000000),
            mid: coins.filter(coin => coin.market_cap >= 100000000 && coin.market_cap < 1000000000),
            new: coins.filter(coin => {
                const daysSinceListing = coin.date_added ? 
                    Math.floor((Date.now() - new Date(coin.date_added).getTime()) / (1000 * 60 * 60 * 24)) : 999;
                return daysSinceListing <= 30;
            }),
            trending: coins.filter(coin => coin.volume_24h > coin.market_cap),
            other: coins.filter(coin => {
                const isTop = coin.market_cap >= 1000000000;
                const isMid = coin.market_cap >= 100000000 && coin.market_cap < 1000000000;
                const isNew = coin.date_added && 
                    Math.floor((Date.now() - new Date(coin.date_added).getTime()) / (1000 * 60 * 60 * 24)) <= 30;
                const isTrending = coin.volume_24h > coin.market_cap;
                return !isTop && !isMid && !isNew && !isTrending;
            })
        };

        cachedData = categorizedCoins;
        lastFetchTime = now;

        return NextResponse.json({
            data: categorizedCoins,
            cached: false,
            nextUpdate: new Date(now + CACHE_DURATIONS.HIGH_CAP)
        });

    } catch (error) {
        console.error('Detailed API Error:', error);
        return NextResponse.json(
            { error: `Failed to fetch coin data: ${error.message}` },
            { status: 500 }
        );
    }
} 