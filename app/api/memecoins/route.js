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

export async function GET(req) {
    try {
        // Add request rate limiting
        const requestIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');
        
        // Validate CMC API key early
        const CMC_API_KEY = process.env.CMC_API_KEY;
        if (!CMC_API_KEY) {
            console.error('CMC API key missing');
            return NextResponse.json(
                { error: 'Service temporarily unavailable' }, 
                { status: 503 }
            );
        }

        // Use cached data if available
        const now = Date.now();
        if (cachedData && lastFetchTime && (now - lastFetchTime) < CACHE_DURATIONS.HIGH_CAP) {
            return NextResponse.json({
                data: cachedData,
                cached: true,
                nextUpdate: new Date(lastFetchTime + CACHE_DURATIONS.HIGH_CAP)
            }, {
                headers: {
                    'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
                    'X-Cache': 'HIT'
                }
            });
        }

        // Fetch new data with timeout and retries
        const fetchWithRetry = async (retries = 3) => {
            try {
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
                return response;
            } catch (error) {
                if (retries > 0 && (error.code === 'ECONNABORTED' || error.response?.status >= 500)) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return fetchWithRetry(retries - 1);
                }
                throw error;
            }
        };

        const response = await fetchWithRetry();

        // Validate response data
        if (!response?.data?.data?.length) {
            throw new Error('Invalid or empty response from CoinMarketCap API');
        }

        // Process and filter coins
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

        // Categorize coins
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

        // Update cache
        cachedData = categorizedCoins;
        lastFetchTime = now;

        return NextResponse.json({
            data: categorizedCoins,
            cached: false,
            nextUpdate: new Date(now + CACHE_DURATIONS.HIGH_CAP)
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
                'X-Cache': 'MISS'
            }
        });

    } catch (error) {
        console.error('API Error:', {
            message: error.message,
            stack: error.stack,
            response: error.response?.data
        });

        // Use cached data if available on error
        if (cachedData) {
            return NextResponse.json({
                data: cachedData,
                cached: true,
                error: 'Using cached data due to API error',
                nextUpdate: new Date(lastFetchTime + CACHE_DURATIONS.HIGH_CAP)
            }, {
                headers: {
                    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
                    'X-Cache': 'STALE'
                }
            });
        }

        return NextResponse.json(
            { error: 'Service temporarily unavailable' },
            { status: 503 }
        );
    }
} 