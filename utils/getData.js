// Export the static data
export const staticData = {
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

export async function getData() {
    return staticData;
}

export async function fetchMemeCoins() {
    try {
        if (process.env.NODE_ENV === 'production') {
            return staticData;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memecoins`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            next: { revalidate: 300 }
        });

        if (!response.ok) {
            console.error('Failed to fetch coins:', response.statusText);
            return staticData;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return staticData;
    }
} 