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
        const allCoins = Object.values(categorizedCoins).flat();
        
        const selectedCoin = allCoins.find(c => 
            c.symbol.toLowerCase() === coin.toLowerCase() ||
            c.slug.toLowerCase() === coin.toLowerCase()
        );

        if (!selectedCoin) {
            return <div>Coin not found</div>;
        }

        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white p-4 md:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <header className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                            {selectedCoin?.name} Moon Calculator
                        </h1>
                        <p className="text-xl text-gray-300 mb-2">
                            Calculate potential returns and plan your exit strategy
                        </p>
                        <p className="text-sm text-gray-400">
                            Current Price: ${selectedCoin?.price.toFixed(6)}
                        </p>
                    </header>

                    {/* Price Stats */}
                    {selectedCoin && (
                        <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <span className="text-purple-300 block mb-1">24h Change</span>
                                    <span className={`text-xl font-bold ${
                                        selectedCoin.percent_change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                        {selectedCoin.percent_change_24h.toFixed(2)}%
                                    </span>
                                </div>
                                <div className="text-center">
                                    <span className="text-purple-300 block mb-1">Market Cap</span>
                                    <span className="text-xl font-bold">
                                        ${new Intl.NumberFormat('en-US', {
                                            notation: 'compact',
                                            maximumFractionDigits: 2
                                        }).format(selectedCoin.market_cap)}
                                    </span>
                                </div>
                                <div className="text-center">
                                    <span className="text-purple-300 block mb-1">Rank</span>
                                    <span className="text-xl font-bold">
                                        #{selectedCoin.rank}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Calculator */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-8">
                            <section className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
                                <h2 className="text-2xl font-bold mb-6">🌙 Moon Mission Planner</h2>
                                <MoonCalculatorWrapper 
                                    coins={allCoins}
                                    defaultCoin={selectedCoin}
                                />
                            </section>
                        </div>

                        {/* Add sidebar content similar to converter page */}
                        <div className="space-y-8">
                            {/* Add relevant sections */}
                        </div>
                    </div>

                    {/* Add FAQ and other SEO content */}
                </div>
            </div>
        );
    } catch (error) {
        console.error('Error:', error);
        return <div>Error loading calculator</div>;
    }
} 