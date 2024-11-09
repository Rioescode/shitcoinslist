import { NextResponse } from 'next/server';

// Static data for build time and fallback
const staticData = {
    data: {
        memecoins: [
            {
                id: 'dogecoin',
                name: 'Dogecoin',
                symbol: 'DOGE',
                slug: 'dogecoin',
                price: 0.20,
                market_cap: 1000000000,
                volume_24h: 100000000,
                percent_change_24h: 5,
                percent_change_7d: 10,
                percent_change_30d: 15,
                rank: 1,
                logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/74.png'
            },
            {
                id: 'shiba-inu',
                name: 'Shiba Inu',
                symbol: 'SHIB',
                slug: 'shiba-inu',
                price: 0.000008,
                market_cap: 500000000,
                volume_24h: 50000000,
                percent_change_24h: 3,
                percent_change_7d: 7,
                percent_change_30d: 12,
                rank: 2,
                logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5994.png'
            },
            {
                id: 'pepe',
                name: 'Pepe',
                symbol: 'PEPE',
                slug: 'pepe',
                price: 0.000001,
                market_cap: 100000000,
                volume_24h: 10000000,
                percent_change_24h: 8,
                percent_change_7d: 15,
                percent_change_30d: 20,
                rank: 3,
                logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/24478.png'
            }
        ]
    }
};

export async function GET() {
    try {
        // During build time or if API fails, return static data
        if (process.env.NODE_ENV === 'production') {
            return NextResponse.json(staticData);
        }

        const CMC_API_KEY = process.env.CMC_API_KEY;
        
        const response = await fetch(
            'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?cryptocurrency_type=meme',
            {
                headers: {
                    'X-CMC_PRO_API_KEY': CMC_API_KEY,
                    'Accept': 'application/json'
                },
                next: { revalidate: 300 }
            }
        );

        if (!response.ok) {
            console.error('CoinMarketCap API error:', response.statusText);
            return NextResponse.json(staticData);
        }

        const data = await response.json();
        
        // Transform API data to match our format
        const formattedData = {
            data: {
                memecoins: data.data.map(coin => ({
                    id: coin.id,
                    name: coin.name,
                    symbol: coin.symbol,
                    slug: coin.slug,
                    price: coin.quote.USD.price,
                    market_cap: coin.quote.USD.market_cap,
                    volume_24h: coin.quote.USD.volume_24h,
                    percent_change_24h: coin.quote.USD.percent_change_24h,
                    percent_change_7d: coin.quote.USD.percent_change_7d,
                    percent_change_30d: coin.quote.USD.percent_change_30d,
                    rank: coin.cmc_rank,
                    logo: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`
                }))
            }
        };

        return NextResponse.json(formattedData);

    } catch (error) {
        console.error('Error fetching memecoins:', error);
        return NextResponse.json(staticData);
    }
} 