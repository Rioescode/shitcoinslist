import MoonCalculatorWrapper from '@/components/MoonCalculatorWrapper';
import { getData } from '@/utils/getData';

export async function generateMetadata({ params }) {
    const { coin } = params;
    const formattedCoin = coin.toUpperCase();
    
    return {
        title: `${formattedCoin} Price Calculator | Profit Targets & Moon Analysis`,
        description: `Calculate ${formattedCoin} profit targets and potential returns. Plan your moon mission with real-time price data and advanced analytics.`,
        keywords: `${coin} moon calculator, ${coin} profit calculator, ${coin} price prediction, ${coin} investment calculator, crypto profit calculator`,
        openGraph: {
            title: `${formattedCoin} Moon Calculator | Profit & Price Targets`,
            description: `Plan your ${formattedCoin} moon mission. Calculate potential returns, set profit targets, and analyze market scenarios.`,
        }
    };
}

export async function generateStaticParams() {
    const { data: categorizedCoins } = await getData();
    const coins = categorizedCoins.memecoins;

    return coins.map(coin => ({
        coin: coin.symbol.toLowerCase()
    }));
}

export default async function MoonCalculatorPage({ params }) {
    try {
        const { coin } = params;
        const { data: categorizedCoins } = await getData();
        const allCoins = categorizedCoins.memecoins;
        
        const selectedCoin = allCoins.find(c => 
            c.symbol.toLowerCase() === coin.toLowerCase() ||
            c.slug.toLowerCase() === coin.toLowerCase()
        );

        if (!selectedCoin) {
            return (
                <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white p-4 md:p-8">
                    <div className="max-w-7xl mx-auto text-center">
                        <h1 className="text-4xl font-bold">Coin Not Found</h1>
                        <p className="mt-4">The requested coin could not be found.</p>
                        <a href="/" className="mt-8 inline-block px-6 py-2 bg-purple-500 rounded-lg hover:bg-purple-600">
                            Return Home
                        </a>
                    </div>
                </div>
            );
        }

        // Add helper function for price targets
        const calculatePriceTargets = (currentPrice) => {
            return [
                { multiplier: 2, label: '2x', price: currentPrice * 2 },
                { multiplier: 5, label: '5x', price: currentPrice * 5 },
                { multiplier: 10, label: '10x', price: currentPrice * 10 },
                { multiplier: 100, label: '100x', price: currentPrice * 100 },
                { multiplier: 1000, label: '1000x', price: currentPrice * 1000 }
            ];
        };

        const priceTargets = selectedCoin ? calculatePriceTargets(selectedCoin.price) : [];

        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white p-4 md:p-8">
                <div className="max-w-7xl mx-auto pt-16">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Enhanced Header */}
                        <header className="text-center mb-12">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                                {selectedCoin?.name} Moon Calculator
                            </h1>
                            <p className="text-xl text-gray-300 mb-2">
                                Plan your moon mission and calculate potential returns
                            </p>
                            <div className="flex justify-center items-center gap-4 text-sm text-gray-400">
                                <span>Current Price: ${selectedCoin?.price.toFixed(6)}</span>
                                <span>•</span>
                                <span>Market Cap: ${new Intl.NumberFormat('en-US', {
                                    notation: 'compact',
                                    maximumFractionDigits: 2
                                }).format(selectedCoin?.market_cap)}</span>
                            </div>
                        </header>

                        {/* Price Stats Banner */}
                        {selectedCoin && (
                            <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-6">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="text-center">
                                        <span className="text-purple-300 block mb-1">24h Change</span>
                                        <span className={`text-xl font-bold ${
                                            selectedCoin.percent_change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                            {selectedCoin.percent_change_24h.toFixed(2)}%
                                        </span>
                                    </div>
                                    <div className="text-center">
                                        <span className="text-purple-300 block mb-1">7d Change</span>
                                        <span className={`text-xl font-bold ${
                                            selectedCoin.percent_change_7d >= 0 ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                            {selectedCoin.percent_change_7d.toFixed(2)}%
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

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column - Calculator */}
                            <div className="space-y-8">
                                {/* Main Calculator */}
                                <section className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
                                    <h2 className="text-2xl font-bold mb-6">🌙 Moon Mission Planner</h2>
                                    <MoonCalculatorWrapper 
                                        coins={allCoins}
                                        defaultCoin={selectedCoin}
                                    />
                                </section>

                                {/* Price Targets */}
                                <section className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
                                    <h2 className="text-2xl font-bold mb-6">🎯 Price Targets</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {priceTargets.map(target => (
                                            <div key={target.label} className="bg-gray-700/30 p-4 rounded-lg">
                                                <div className="text-2xl font-bold text-purple-400">{target.label}</div>
                                                <div className="text-sm text-gray-400">Target Price</div>
                                                <div className="font-mono mt-1">${target.price.toFixed(6)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            {/* Right Column - Analysis */}
                            <div className="space-y-8">
                                {/* Market Analysis */}
                                <section className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
                                    <h2 className="text-2xl font-bold mb-6">📊 Market Analysis</h2>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-gray-700/30 rounded-lg">
                                            <h3 className="font-bold text-purple-400">Market Position</h3>
                                            <p className="text-sm text-gray-300 mt-2">
                                                {selectedCoin?.name} currently ranks #{selectedCoin?.rank} with a 
                                                market cap of ${new Intl.NumberFormat('en-US').format(selectedCoin?.market_cap)}.
                                                {selectedCoin?.market_cap > 1000000000 
                                                    ? ' This indicates a well-established position in the market.'
                                                    : ' There may be room for significant growth.'}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-gray-700/30 rounded-lg">
                                            <h3 className="font-bold text-purple-400">Volume Analysis</h3>
                                            <p className="text-sm text-gray-300 mt-2">
                                                24h trading volume of ${new Intl.NumberFormat('en-US').format(selectedCoin?.volume_24h)}
                                                represents {((selectedCoin?.volume_24h / selectedCoin?.market_cap) * 100).toFixed(2)}% 
                                                of market cap, indicating {
                                                    selectedCoin?.volume_24h > selectedCoin?.market_cap 
                                                        ? 'very high trading activity'
                                                        : 'normal market conditions'
                                                }.
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                {/* Supply Info */}
                                <section className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
                                    <h2 className="text-2xl font-bold mb-6">💫 Supply Analysis</h2>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-gray-700/30 rounded-lg">
                                                <div className="text-sm text-gray-400">Circulating Supply</div>
                                                <div className="font-bold">
                                                    {new Intl.NumberFormat('en-US').format(selectedCoin?.circulating_supply)}
                                                </div>
                                            </div>
                                            <div className="p-4 bg-gray-700/30 rounded-lg">
                                                <div className="text-sm text-gray-400">Max Supply</div>
                                                <div className="font-bold">
                                                    {selectedCoin?.max_supply 
                                                        ? new Intl.NumberFormat('en-US').format(selectedCoin?.max_supply)
                                                        : '∞'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-gray-700/30 rounded-lg">
                                            <h3 className="font-bold text-purple-400">Supply Impact</h3>
                                            <p className="text-sm text-gray-300 mt-2">
                                                {selectedCoin?.max_supply
                                                    ? `With ${((selectedCoin?.circulating_supply / selectedCoin?.max_supply) * 100).toFixed(2)}% of max supply in circulation, there's limited dilution risk.`
                                                    : 'No maximum supply limit means potential for inflation.'}
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>

                        {/* FAQ Section */}
                        <section className="bg-gray-800/50 backdrop-blur-md rounded-xl p-8 border border-gray-700/50">
                            <h2 className="text-2xl font-bold mb-6">❓ Frequently Asked Questions</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-purple-400">
                                        What is a realistic price target for {selectedCoin?.name}?
                                    </h3>
                                    <p className="text-sm text-gray-300">
                                        Price targets depend on market conditions and overall crypto market growth.
                                        Consider market cap implications: reaching $1 would mean a market cap of 
                                        ${new Intl.NumberFormat('en-US').format(selectedCoin?.circulating_supply)}.
                                    </p>
                                </div>
                                
                                <div>
                                    <h3 className="font-bold text-purple-400">
                                        How to calculate potential returns?
                                    </h3>
                                    <p className="text-sm text-gray-300">
                                        Use our calculator to input your investment amount and target price.
                                        Remember to account for trading fees and potential slippage in your calculations.
                                    </p>
                                </div>
                                
                                <div>
                                    <h3 className="font-bold text-purple-400">
                                        What factors affect price growth?
                                    </h3>
                                    <p className="text-sm text-gray-300">
                                        Key factors include market sentiment, trading volume, community growth,
                                        development activity, and overall crypto market conditions.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Disclaimer */}
                        <footer className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 text-center">
                            <p className="text-sm text-gray-400">
                                Calculations are based on current market data and historical performance.
                                Past performance does not guarantee future results. Always conduct your own
                                research and invest responsibly.
                            </p>
                        </footer>
                    </div>
                </div>
            </div>
        );

    } catch (error) {
        console.error('Error:', error);
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white p-4 md:p-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl font-bold">Error Loading Calculator</h1>
                    <p className="mt-4">There was an error loading the calculator. Please try again later.</p>
                    <a href="/" className="mt-8 inline-block px-6 py-2 bg-purple-500 rounded-lg hover:bg-purple-600">
                        Return Home
                    </a>
                </div>
            </div>
        );
    }
} 