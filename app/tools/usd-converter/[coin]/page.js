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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/allcoins`);
    const { data } = await response.json();
    const allCoins = data.allCoins;
    
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
                <div className="mt-12 prose prose-invert max-w-none">
                    <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-8 space-y-8">
                        <section>
                            <h2 className="text-3xl font-bold mb-4">{selectedCoin?.name || params.coin} Price Calculator</h2>
                            <p className="text-lg text-gray-300">
                                Get instant {selectedCoin?.name} ({selectedCoin?.symbol}) to USD conversions with our real-time calculator. 
                                Track live {selectedCoin?.symbol} prices, analyze market trends, and make informed trading decisions with 
                                our comprehensive crypto conversion tools.
                            </p>
                        </section>

                        <section className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-2xl font-bold mb-4">Real-Time Conversion Features</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-2">
                                        <span className="text-purple-400">⚡</span>
                                        Instant {selectedCoin?.symbol} to USD calculations
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-purple-400">🔄</span>
                                        Live price updates every 15 seconds
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-purple-400">📊</span>
                                        Detailed market statistics
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-purple-400">💹</span>
                                        Historical price comparisons
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold mb-4">Market Insights</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-2">
                                        <span className="text-purple-400">📈</span>
                                        24h Volume: ${new Intl.NumberFormat('en-US', {
                                            notation: 'compact',
                                            maximumFractionDigits: 2
                                        }).format(selectedCoin?.volume_24h)}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-purple-400">💰</span>
                                        Market Cap: ${new Intl.NumberFormat('en-US', {
                                            notation: 'compact',
                                            maximumFractionDigits: 2
                                        }).format(selectedCoin?.market_cap)}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-purple-400">🔄</span>
                                        24h Change: {selectedCoin?.percent_change_24h.toFixed(2)}%
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-purple-400">📊</span>
                                        Rank: #{selectedCoin?.cmc_rank || 'N/A'}
                                    </li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-2xl font-bold mb-4">Why Use Our {selectedCoin?.name} Converter?</h3>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-gray-700/30 p-6 rounded-lg">
                                    <h4 className="font-bold mb-2">🎯 Precision</h4>
                                    <p className="text-gray-300">
                                        Get exact {selectedCoin?.symbol} to USD conversions with up to 8 decimal places accuracy.
                                    </p>
                                </div>
                                <div className="bg-gray-700/30 p-6 rounded-lg">
                                    <h4 className="font-bold mb-2">⚡ Speed</h4>
                                    <p className="text-gray-300">
                                        Instant calculations and real-time price updates for quick decision making.
                                    </p>
                                </div>
                                <div className="bg-gray-700/30 p-6 rounded-lg">
                                    <h4 className="font-bold mb-2">📊 Analytics</h4>
                                    <p className="text-gray-300">
                                        Comprehensive market data and historical price comparisons.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-2xl font-bold mb-4">Market Analysis</h3>
                            <p className="text-gray-300">
                                {selectedCoin?.name} ({selectedCoin?.symbol}) is currently trading at ${selectedCoin?.price.toFixed(6)} USD
                                with a market capitalization of ${new Intl.NumberFormat('en-US').format(selectedCoin?.market_cap)} USD.
                                The 24-hour trading volume stands at ${new Intl.NumberFormat('en-US').format(selectedCoin?.volume_24h)} USD,
                                indicating {selectedCoin?.volume_24h > selectedCoin?.market_cap ? 'very high' : 'moderate'} market activity.
                            </p>
                            <div className="mt-4 grid md:grid-cols-2 gap-6">
                                <div className="bg-gray-700/30 p-6 rounded-lg">
                                    <h4 className="font-bold mb-2">📈 Price Movement</h4>
                                    <p className="text-gray-300">
                                        {selectedCoin?.name} has moved {selectedCoin?.percent_change_24h >= 0 ? 'up' : 'down'} 
                                        {Math.abs(selectedCoin?.percent_change_24h).toFixed(2)}% in the last 24 hours, showing
                                        {Math.abs(selectedCoin?.percent_change_24h) > 10 ? ' high' : ' normal'} volatility.
                                    </p>
                                </div>
                                <div className="bg-gray-700/30 p-6 rounded-lg">
                                    <h4 className="font-bold mb-2">🌊 Volume Analysis</h4>
                                    <p className="text-gray-300">
                                        Trading volume is {((selectedCoin?.volume_24h / selectedCoin?.market_cap) * 100).toFixed(2)}% 
                                        of market cap, suggesting {selectedCoin?.volume_24h > selectedCoin?.market_cap ? 'very high' : 'moderate'} 
                                        trading activity.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-2xl font-bold mb-4">Trading Tips</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-gray-700/30 p-6 rounded-lg">
                                    <h4 className="font-bold mb-2">📊 Market Analysis</h4>
                                    <ul className="space-y-2">
                                        <li>• Monitor volume trends for trading signals</li>
                                        <li>• Track price movements across timeframes</li>
                                        <li>• Analyze market depth and liquidity</li>
                                        <li>• Stay updated with market news</li>
                                    </ul>
                                </div>
                                <div className="bg-gray-700/30 p-6 rounded-lg">
                                    <h4 className="font-bold mb-2">⚠️ Risk Management</h4>
                                    <ul className="space-y-2">
                                        <li>• Set clear entry and exit points</li>
                                        <li>• Use stop-loss orders</li>
                                        <li>• Diversify your portfolio</li>
                                        <li>• Never invest more than you can lose</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section className="mt-8">
                            <h3 className="text-2xl font-bold mb-6">Frequently Asked Questions</h3>
                            <div className="space-y-4">
                                <div className="bg-gray-700/30 p-6 rounded-lg">
                                    <h4 className="font-bold text-xl mb-2">What is the current {selectedCoin?.name} price?</h4>
                                    <p className="text-gray-300">
                                        The current price of {selectedCoin?.name} ({selectedCoin?.symbol}) is ${selectedCoin?.price.toFixed(6)} USD. 
                                        This price is updated in real-time based on market data from major cryptocurrency exchanges.
                                    </p>
                                </div>

                                <div className="bg-gray-700/30 p-6 rounded-lg">
                                    <h4 className="font-bold text-xl mb-2">How accurate is this {selectedCoin?.name} converter?</h4>
                                    <p className="text-gray-300">
                                        Our {selectedCoin?.name} converter uses real-time price data from major exchanges and updates every 15 seconds. 
                                        While highly accurate, actual trading prices may vary slightly due to factors like exchange fees, liquidity, 
                                        and market depth.
                                    </p>
                                </div>

                                <div className="bg-gray-700/30 p-6 rounded-lg">
                                    <h4 className="font-bold text-xl mb-2">Where can I buy {selectedCoin?.name}?</h4>
                                    <p className="text-gray-300">
                                        {selectedCoin?.name} can be purchased on major cryptocurrency exchanges like Binance, Coinbase, and KuCoin. 
                                        {selectedCoin?.isTopCoin 
                                            ? ' As a top 100 cryptocurrency, it is widely available on most major exchanges.' 
                                            : ' As a meme coin, it may be available on decentralized exchanges like Uniswap or PancakeSwap.'}
                                    </p>
                                </div>

                                <div className="bg-gray-700/30 p-6 rounded-lg">
                                    <h4 className="font-bold text-xl mb-2">How is {selectedCoin?.name}'s price calculated?</h4>
                                    <p className="text-gray-300">
                                        {selectedCoin?.name}'s price is determined by supply and demand across various cryptocurrency exchanges. 
                                        Our converter uses a volume-weighted average price (VWAP) from major trading platforms to ensure accurate 
                                        conversions.
                                    </p>
                                </div>

                                <div className="bg-gray-700/30 p-6 rounded-lg">
                                    <h4 className="font-bold text-xl mb-2">What affects {selectedCoin?.name} price?</h4>
                                    <p className="text-gray-300">
                                        {selectedCoin?.name} price is influenced by various factors including market sentiment, trading volume 
                                        (currently ${new Intl.NumberFormat('en-US').format(selectedCoin?.volume_24h)}), overall crypto market 
                                        conditions, and {selectedCoin?.isTopCoin ? 'institutional adoption' : 'community engagement'}.
                                    </p>
                                </div>

                                <div className="bg-gray-700/30 p-6 rounded-lg">
                                    <h4 className="font-bold text-xl mb-2">How volatile is {selectedCoin?.name}?</h4>
                                    <p className="text-gray-300">
                                        {selectedCoin?.name} has shown {Math.abs(selectedCoin?.percent_change_24h) > 20 ? 'high' : 'moderate'} volatility, 
                                        with a 24-hour price change of {selectedCoin?.percent_change_24h.toFixed(2)}% and a 7-day change 
                                        of {selectedCoin?.percent_change_7d.toFixed(2)}%. Always consider this volatility in your trading decisions.
                                    </p>
                                </div>

                                <div className="bg-gray-700/30 p-6 rounded-lg">
                                    <h4 className="font-bold text-xl mb-2">What is {selectedCoin?.name}'s market position?</h4>
                                    <p className="text-gray-300">
                                        {selectedCoin?.name} has a market capitalization of ${new Intl.NumberFormat('en-US').format(selectedCoin?.market_cap)}, 
                                        ranking #{selectedCoin?.cmc_rank || 'N/A'} among all cryptocurrencies. The 24-hour trading volume 
                                        is ${new Intl.NumberFormat('en-US').format(selectedCoin?.volume_24h)}, representing 
                                        {((selectedCoin?.volume_24h / selectedCoin?.market_cap) * 100).toFixed(2)}% of its market cap.
                                    </p>
                                </div>

                                <div className="bg-gray-700/30 p-6 rounded-lg">
                                    <h4 className="font-bold text-xl mb-2">How do I track {selectedCoin?.name} price changes?</h4>
                                    <p className="text-gray-300">
                                        You can use our converter for real-time rates, set up price alerts, and monitor market statistics. 
                                        We provide historical comparisons, detailed market analysis, and live price updates to help you track 
                                        {selectedCoin?.name}'s performance effectively.
                                    </p>
                                </div>

                                <div className="bg-gray-700/30 p-6 rounded-lg">
                                    <h4 className="font-bold text-xl mb-2">Is now a good time to buy {selectedCoin?.name}?</h4>
                                    <p className="text-gray-300">
                                        The best time to buy depends on your investment strategy and risk tolerance. Currently, {selectedCoin?.name} 
                                        shows {selectedCoin?.percent_change_24h >= 0 ? 'positive' : 'negative'} momentum with 
                                        {selectedCoin?.volume_24h > selectedCoin?.market_cap ? ' high' : ' moderate'} trading volume. Always do your 
                                        own research and never invest more than you can afford to lose.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-2xl font-bold mb-6">Popular Converters</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {allCoins
                                    .filter(coin => coin.slug !== selectedCoin?.slug) // Exclude current coin
                                    .sort((a, b) => b.volume_24h - a.volume_24h) // Sort by volume
                                    .slice(0, 8) // Take top 8 coins
                                    .map(coin => (
                                        <a
                                            key={coin.id}
                                            href={`/tools/usd-converter/${coin.slug}`}
                                            className="bg-gray-700/30 p-4 rounded-lg hover:bg-gray-700/50 transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <img 
                                                    src={coin.logo}
                                                    alt={coin.name}
                                                    className="w-8 h-8 rounded-full group-hover:scale-110 transition-transform"
                                                />
                                                <div>
                                                    <div className="font-bold truncate">{coin.name}</div>
                                                    <div className="text-sm text-gray-400 flex items-center gap-2">
                                                        <span>{coin.symbol}</span>
                                                        <span className={coin.percent_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                                                            {coin.percent_change_24h >= 0 ? '↗' : '↘'} 
                                                            {Math.abs(coin.percent_change_24h).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                            </div>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-2xl font-bold mb-6">Related Tools</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <a
                                    href={`/compare/${selectedCoin?.symbol.toLowerCase()}`}
                                    className="bg-gray-700/30 p-6 rounded-lg hover:bg-gray-700/50 transition-all group"
                                >
                                    <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
                                        <span>⚔️</span>
                                        <span>Compare {selectedCoin?.name}</span>
                                    </h4>
                                    <p className="text-gray-400">
                                        Compare with other cryptocurrencies
                                    </p>
                                </a>

                                <a
                                    href={`/converter/${selectedCoin?.symbol.toLowerCase()}/eur`}
                                    className="bg-gray-700/30 p-6 rounded-lg hover:bg-gray-700/50 transition-all group"
                                >
                                    <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
                                        <span>💱</span>
                                        <span>{selectedCoin?.name} to EUR</span>
                                    </h4>
                                    <p className="text-gray-400">
                                        Convert to other currencies
                                    </p>
                                </a>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-2xl font-bold mb-6">Other Currency Pairs</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {['EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'].map(currency => (
                                    <a
                                        key={currency}
                                        href={`/converter/${selectedCoin?.symbol.toLowerCase()}/${currency.toLowerCase()}`}
                                        className="bg-gray-700/30 p-4 rounded-lg hover:bg-gray-700/50 transition-all text-center"
                                    >
                                        <div className="font-bold">{selectedCoin?.symbol} to {currency}</div>
                                        <div className="text-sm text-gray-400">Live conversion</div>
                                    </a>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
} 