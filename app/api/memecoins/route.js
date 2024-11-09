import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        // Get the host from the request headers
        const host = req.headers.get('host');
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const baseUrl = `${protocol}://${host}`;
        
        console.log('Environment:', process.env.NODE_ENV);
        console.log('Base URL:', baseUrl);
        console.log('API Key available:', !!process.env.CMC_API_KEY);

        const CMC_API_KEY = process.env.CMC_API_KEY;
        if (!CMC_API_KEY) {
            throw new Error('CMC_API_KEY is not configured');
        }

        const response = await fetch(
            'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=1000',
            {
                headers: {
                    'X-CMC_PRO_API_KEY': CMC_API_KEY,
                },
                next: { revalidate: 300 } // Cache for 5 minutes
            }
        );

        if (!response.ok) {
            throw new Error(`CoinMarketCap API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched coins:', data.data.length);

        // Process and return the data
        const coins = data.data.map(coin => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            slug: coin.slug,
            rank: coin.cmc_rank,
            price: coin.quote.USD.price,
            market_cap: coin.quote.USD.market_cap,
            volume_24h: coin.quote.USD.volume_24h,
            percent_change_24h: coin.quote.USD.percent_change_24h,
            percent_change_7d: coin.quote.USD.percent_change_7d,
            percent_change_30d: coin.quote.USD.percent_change_30d,
            logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`
        }));

        // Categorize coins
        const categorizedCoins = {
            top: coins.filter(coin => coin.market_cap >= 1000000000),
            mid: coins.filter(coin => coin.market_cap >= 100000000 && coin.market_cap < 1000000000),
            new: coins.filter(coin => coin.rank > 1000),
            trending: coins.filter(coin => coin.volume_24h > 1000000).sort((a, b) => b.volume_24h - a.volume_24h).slice(0, 20),
            other: coins.filter(coin => coin.market_cap < 100000000 && coin.rank <= 1000)
        };

        return NextResponse.json({
            data: categorizedCoins,
            cached: false,
            nextUpdate: new Date(Date.now() + 300000).toISOString()
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: `Failed to fetch coin data: ${error.message}` },
            { status: 500 }
        );
    }
} 