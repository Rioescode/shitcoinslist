import USDConverterWrapper from '@/components/USDConverterWrapper';

export async function generateMetadata({ params }) {
    const { coin } = params;
    const formattedCoin = coin.replace(/-/g, ' ').toUpperCase();
    
    return {
        title: `${formattedCoin} to USD Converter | Real-time Price Calculator`,
        description: `Convert ${formattedCoin} to USD instantly. Get real-time ${formattedCoin} price and calculate exact USD value. Free cryptocurrency converter.`,
        keywords: `${coin} converter, ${coin} to usd, ${coin} calculator, ${coin} price, cryptocurrency converter`,
    };
}

export default async function CoinConverterPage({ params }) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memecoins`);
    const { data: categorizedCoins } = await response.json();
    const allCoins = Object.values(categorizedCoins).flat();
    
    const coinSlug = params.coin;
    const selectedCoin = allCoins.find(c => c.slug === coinSlug);
    
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <nav className="text-sm text-gray-400 mb-8">
                    <a href="/" className="hover:text-purple-400">Home</a>
                    <span className="mx-2">/</span>
                    <a href="/tools/usd-converter" className="hover:text-purple-400">USD Converter</a>
                    <span className="mx-2">/</span>
                    <span>{selectedCoin?.name || params.coin}</span>
                </nav>

                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-4">
                        💱 {selectedCoin?.name || params.coin} to USD Converter
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Convert {selectedCoin?.name || params.coin} to USD instantly with our real-time calculator.
                        Get accurate price conversions and track your {selectedCoin?.symbol || ''} value.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Main Converter */}
                    <div className="space-y-8">
                        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6">
                            <h2 className="text-xl font-bold mb-4">Quick Converter</h2>
                            <USDConverterWrapper 
                                coins={allCoins}
                                defaultCoin={selectedCoin}
                            />
                        </div>
                    </div>

                    {/* Coin Info */}
                    {selectedCoin && (
                        <div className="space-y-8">
                            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6">
                                <h2 className="text-xl font-bold mb-4">Current Market Data</h2>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Price:</span>
                                        <span className="font-bold">${selectedCoin.price.toFixed(8)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">24h Change:</span>
                                        <span className={`font-bold ${
                                            selectedCoin.percent_change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                            {selectedCoin.percent_change_24h.toFixed(2)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Market Cap:</span>
                                        <span className="font-bold">
                                            ${new Intl.NumberFormat('en-US', {
                                                notation: 'compact',
                                                maximumFractionDigits: 2
                                            }).format(selectedCoin.market_cap)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* SEO Content */}
                <div className="mt-8 prose prose-invert max-w-none">
                    <h2>{selectedCoin?.name || params.coin} Price Calculator</h2>
                    <p>
                        Get instant {selectedCoin?.name || params.coin} to USD conversions with our real-time calculator.
                        Whether you're tracking your investment or planning trades, our converter provides accurate,
                        up-to-the-minute price data for {selectedCoin?.symbol || ''}.
                    </p>
                    
                    <h2>How to Use the Converter</h2>
                    <ol>
                        <li>Enter the amount of {selectedCoin?.symbol || ''} you want to convert</li>
                        <li>See the USD value instantly</li>
                        <li>Or enter USD amount to see how much {selectedCoin?.symbol || ''} you can get</li>
                        <li>Get real-time price updates and market data</li>
                    </ol>

                    <h2>Why Track {selectedCoin?.name || params.coin} Price?</h2>
                    <p>
                        {selectedCoin?.name || params.coin} is a popular meme cryptocurrency that has gained significant
                        attention in the crypto market. With our converter, you can easily track its value and make
                        informed trading decisions based on real-time market data.
                    </p>
                </div>
            </div>
        </div>
    );
} 