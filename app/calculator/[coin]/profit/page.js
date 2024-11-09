import MoonCalculatorWrapper from '@/components/MoonCalculatorWrapper';

export async function generateMetadata({ params }) {
    const { coin } = params;
    const formattedCoin = coin.toUpperCase();
    
    return {
        title: `${formattedCoin} Profit Calculator | Moon Mission Planner`,
        description: `Calculate ${formattedCoin} profit targets and potential returns. Plan your exit strategy with our advanced moon calculator.`,
        keywords: `${coin} calculator, ${coin} profit, ${coin} moon calculator, ${coin} price target, crypto profit calculator`,
        openGraph: {
            title: `${formattedCoin} Profit Calculator`,
            description: `Calculate potential returns and plan your exit strategy for ${formattedCoin}. Free moon calculator with real-time prices.`,
        }
    };
}

export async function generateStaticParams() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memecoins`);
        
        // Check if response is ok
        if (!response.ok) {
            console.error('Failed to fetch coins:', response.statusText);
            return [];
        }

        // Parse JSON safely
        const data = await response.json();
        
        // Validate data structure
        if (!data || !data.data) {
            console.error('Invalid data structure');
            return [];
        }

        const coins = Object.values(data.data).flat();

        return coins.map(coin => ({
            coin: coin.symbol.toLowerCase()
        }));

    } catch (error) {
        console.error('Error generating static params:', error);
        return []; // Return empty array on error
    }
}

export default async function CoinCalculatorPage({ params }) {
    try {
        const { coin } = params;
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memecoins`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch coin data');
        }

        const { data: categorizedCoins } = await response.json();
        if (!categorizedCoins) {
            throw new Error('Invalid data structure');
        }

        const allCoins = Object.values(categorizedCoins).flat();
        
        const selectedCoin = allCoins.find(c => 
            c.symbol.toLowerCase() === coin.toLowerCase() ||
            c.slug.toLowerCase() === coin.toLowerCase()
        );

        // Add validation for required properties
        if (!selectedCoin || typeof selectedCoin.price === 'undefined') {
            return (
                <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white p-4 md:p-8">
                    <div className="max-w-7xl mx-auto text-center">
                        <h1 className="text-4xl font-bold mb-4">Coin Not Found</h1>
                        <p className="text-gray-400 mb-8">The coin data is currently unavailable.</p>
                        <a href="/" className="inline-block px-6 py-3 bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors">
                            Back to Home
                        </a>
                    </div>
                </div>
            );
        }

        // Ensure all required properties have fallback values
        const safeSelectedCoin = {
            ...selectedCoin,
            price: selectedCoin.price || 0,
            market_cap: selectedCoin.market_cap || 0,
            volume_24h: selectedCoin.volume_24h || 0,
            name: selectedCoin.name || coin.toUpperCase(),
            symbol: selectedCoin.symbol || coin.toUpperCase()
        };

        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <header className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                            {safeSelectedCoin.name} Moon Calculator
                        </h1>
                        <p className="text-xl text-gray-300 mb-2">
                            Calculate potential returns and plan your exit strategy
                        </p>
                        <p className="text-sm text-gray-400">
                            Current Price: ${safeSelectedCoin.price.toFixed(6)}
                        </p>
                    </header>
                    <MoonCalculatorWrapper coin={safeSelectedCoin} />
                </div>
            </div>
        );

    } catch (error) {
        console.error('Error in CoinCalculatorPage:', error);
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white p-4 md:p-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl font-bold mb-4">Error Loading Calculator</h1>
                    <p className="text-gray-400 mb-8">Unable to load coin data. Please try again later.</p>
                    <a href="/" className="inline-block px-6 py-3 bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors">
                        Back to Home
                    </a>
                </div>
            </div>
        );
    }
} 