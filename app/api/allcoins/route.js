import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
    try {
        const CMC_API_KEY = process.env.CMC_API_KEY;
        
        // Fetch top 100 coins from CoinMarketCap
        const topCoinsResponse = await axios({
            method: 'GET',
            url: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
            params: {
                start: '1',
                limit: '100',
                convert: 'USD',
                sort: 'market_cap',
                sort_dir: 'desc'
            },
            headers: {
                'X-CMC_PRO_API_KEY': CMC_API_KEY,
                'Accept': 'application/json'
            }
        });

        // Format top coins data
        const topCoins = topCoinsResponse.data.data.map(coin => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            slug: coin.slug,
            cmc_rank: coin.cmc_rank,
            price: coin.quote.USD.price,
            percent_change_24h: coin.quote.USD.percent_change_24h,
            percent_change_7d: coin.quote.USD.percent_change_7d,
            percent_change_30d: coin.quote.USD.percent_change_30d,
            market_cap: coin.quote.USD.market_cap,
            volume_24h: coin.quote.USD.volume_24h,
            circulating_supply: coin.circulating_supply,
            total_supply: coin.total_supply,
            max_supply: coin.max_supply,
            logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`,
            isTopCoin: true,
            date_added: coin.date_added,
            last_updated: coin.last_updated
        }));

        // Fetch meme coins from your existing endpoint
        const memeCoinsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memecoins`);
        const memeData = await memeCoinsResponse.json();
        const memeCoins = Object.values(memeData.data || {})
            .flat()
            .map(coin => ({
                ...coin,
                isTopCoin: false
            }));

        // Combine and sort all coins
        const allCoins = [...topCoins, ...memeCoins]
            .sort((a, b) => {
                // Sort by CMC rank first for top coins
                if (a.isTopCoin && b.isTopCoin) {
                    return (a.cmc_rank || 0) - (b.cmc_rank || 0);
                }
                // Then by market cap
                return b.market_cap - a.market_cap;
            });

        return NextResponse.json({
            status: 'success',
            data: {
                allCoins,
                categories: {
                    topCoins,
                    memeCoins
                }
            },
            timestamp: new Date().toISOString(),
            total_count: allCoins.length,
            top_coins_count: topCoins.length,
            meme_coins_count: memeCoins.length
        });

    } catch (error) {
        console.error('CoinMarketCap API Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        return NextResponse.json({
            status: 'error',
            message: 'Failed to fetch cryptocurrency data',
            error: error.message
        }, { status: 500 });
    }
} 