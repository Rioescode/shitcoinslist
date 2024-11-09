import { NextResponse } from 'next/server';

// Fallback data in case API fails
const fallbackData = {
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
                rank: 1
            },
            // Add more fallback coins if needed
        ]
    }
};

export async function GET() {
    try {
        const CMC_API_KEY = process.env.CMC_API_KEY;
        
        const response = await fetch(
            'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?cryptocurrency_type=meme',
            {
                headers: {
                    'X-CMC_PRO_API_KEY': CMC_API_KEY,
                    'Accept': 'application/json'
                },
                next: { revalidate: 300 } // Cache for 5 minutes
            }
        );

        if (!response.ok) {
            console.error('CoinMarketCap API error:', response.statusText);
            return NextResponse.json(fallbackData);
        }

        const data = await response.json();
        
        if (!data || !data.data) {
            console.error('Invalid API response structure');
            return NextResponse.json(fallbackData);
        }

        // Transform data to match expected format
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
                    rank: coin.cmc_rank
                }))
            }
        };

        return NextResponse.json(formattedData);

    } catch (error) {
        console.error('Error fetching memecoins:', error);
        return NextResponse.json(fallbackData);
    }
} 