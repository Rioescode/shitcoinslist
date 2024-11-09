// Fallback data structure
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
            }
        ]
    }
};

export async function fetchMemeCoins() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memecoins`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            next: { revalidate: 300 } // Cache for 5 minutes
        });

        if (!response.ok) {
            console.error('Failed to fetch coins:', response.statusText);
            return fallbackData;
        }

        const data = await response.json();
        
        if (!data || !data.data) {
            console.error('Invalid data structure');
            return fallbackData;
        }

        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return fallbackData;
    }
} 