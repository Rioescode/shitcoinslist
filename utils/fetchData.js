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
        const response = await fetch('/api/memecoins', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            next: { revalidate: 300 }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch coins');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return {
            data: {
                memecoins: [],
                trending: [],
                new: []
            }
        };
    }
} 