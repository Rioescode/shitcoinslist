import USDConverterWrapper from '@/components/USDConverterWrapper';

function generateComparisonTable(amounts, currentPrice, historicalPrice, period) {
    return amounts.map(amount => ({
        amount,
        currentValue: amount * currentPrice,
        historicalValue: amount * historicalPrice,
        change: ((amount * currentPrice - amount * historicalPrice) / (amount * historicalPrice)) * 100
    }));
}

export async function generateMetadata({ params }) {
    const { coin, currency } = params;
    const formattedCoin = coin.toUpperCase();
    
    return {
        title: `Convert ${formattedCoin} to ${currency.toUpperCase()} | Real-time Price Calculator`,
        description: `Free ${formattedCoin} to ${currency.toUpperCase()} converter. Get live ${formattedCoin} price and calculate exact ${currency.toUpperCase()} value instantly.`,
        keywords: `${coin} to ${currency}, ${coin} converter, ${coin} calculator, ${coin} price, cryptocurrency converter, ${coin} ${currency} calculator`,
        openGraph: {
            title: `${formattedCoin} to ${currency.toUpperCase()} Converter`,
            description: `Convert ${formattedCoin} to ${currency.toUpperCase()} with our free calculator. Get real-time prices and instant conversions.`,
        }
    };
}

export async function generateStaticParams() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memecoins`);
        if (!response.ok) {
            console.error('Failed to fetch coins:', response.statusText);
            return [];
        }
        const data = await response.json();
        const currencies = ['usd', 'eur', 'gbp'];
        const coins = Object.values(data.data || {}).flat();

        return coins.flatMap(coin => 
            currencies.map(currency => ({
                coin: coin.symbol.toLowerCase(),
                currency: currency
            }))
        );
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

export default async function CoinConverterPage({ params }) {
    const { coin, currency } = params;
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memecoins`);
    const { data: categorizedCoins } = await response.json();
    const allCoins = Object.values(categorizedCoins).flat();
    
    const selectedCoin = allCoins.find(c => 
        c.symbol.toLowerCase() === coin.toLowerCase() ||
        c.slug.toLowerCase() === coin.toLowerCase()
    );

    const comparisonAmounts = [0.5, 1, 5, 10, 50, 100, 500, 1000];
    
    const comparisons = {
        '24h': generateComparisonTable(
            comparisonAmounts,
            selectedCoin?.price || 0,
            selectedCoin?.price / (1 + (selectedCoin?.percent_change_24h || 0) / 100) || 0,
            '24h'
        ),
        '1m': generateComparisonTable(
            comparisonAmounts,
            selectedCoin?.price || 0,
            selectedCoin?.price / (1 + (selectedCoin?.percent_change_30d || 0) / 100) || 0,
            '1m'
        ),
        '1y': generateComparisonTable(
            comparisonAmounts,
            selectedCoin?.price || 0,
            selectedCoin?.price / (1 + (selectedCoin?.percent_change_1y || 0) / 100) || 0,
            '1y'
        )
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* SEO-optimized Header */}
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                        {selectedCoin?.name || coin.toUpperCase()} to {currency.toUpperCase()} Converter
                    </h1>
                    <p className="text-xl text-gray-300 mb-2">
                        Current Rate: 1 {coin.toUpperCase()} = ${selectedCoin?.price.toFixed(6)} {currency.toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-400">
                        Last updated: {new Date().toLocaleTimeString()}
                    </p>
                </header>

                {/* Price Stats Banner */}
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
                                <span className="text-purple-300 block mb-1">7d Change</span>
                                <span className={`text-xl font-bold ${
                                    selectedCoin.percent_change_7d >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                    {selectedCoin.percent_change_7d.toFixed(2)}%
                                </span>
                            </div>
                            <div className="text-center">
                                <span className="text-purple-300 block mb-1">30d Change</span>
                                <span className={`text-xl font-bold ${
                                    selectedCoin.percent_change_30d >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                    {selectedCoin.percent_change_30d.toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Converter and Tables */}
                    <div className="space-y-8">
                        {/* Main Converter */}
                        <section className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
                            <h2 className="text-2xl font-bold mb-6">💱 Quick Convert</h2>
                            <USDConverterWrapper 
                                coins={allCoins}
                                defaultCoin={selectedCoin}
                                defaultCurrency={currency}
                            />
                        </section>

                        {/* Quick Reference Tables */}
                        <section className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
                            <h2 className="text-2xl font-bold mb-6">📊 Common Conversions</h2>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-lg mb-2">{coin.toUpperCase()} to {currency.toUpperCase()}</h3>
                                    <div className="space-y-2">
                                        {[0.5, 1, 5, 10, 50, 100, 500, 1000].map(amount => (
                                            <div key={amount} className="flex justify-between text-sm">
                                                <span>{amount} {coin.toUpperCase()}</span>
                                                <span>${(amount * selectedCoin?.price).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg mb-2">{currency.toUpperCase()} to {coin.toUpperCase()}</h3>
                                    <div className="space-y-2">
                                        {[0.5, 1, 5, 10, 50, 100, 500, 1000].map(amount => (
                                            <div key={amount} className="flex justify-between text-sm">
                                                <span>${amount}</span>
                                                <span>{(amount / selectedCoin?.price).toFixed(2)} {coin.toUpperCase()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Historical Comparison Tables */}
                        <section className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
                            <h2 className="text-2xl font-bold mb-6">📅 Historical Comparisons</h2>
                            
                            {/* 24h Comparison */}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-4">Today vs. 24 hours ago</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left border-b border-gray-700">
                                                <th className="p-2">Amount</th>
                                                <th className="p-2">Today</th>
                                                <th className="p-2">24h ago</th>
                                                <th className="p-2">Change</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {comparisons['24h'].map(row => (
                                                <tr key={row.amount} className="border-b border-gray-700/50">
                                                    <td className="p-2">{row.amount} {coin.toUpperCase()}</td>
                                                    <td className="p-2">${row.currentValue.toFixed(2)}</td>
                                                    <td className="p-2">${row.historicalValue.toFixed(2)}</td>
                                                    <td className={`p-2 ${row.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {row.change.toFixed(2)}%
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* 1 Month Comparison */}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-4">Today vs. 1 month ago</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left border-b border-gray-700">
                                                <th className="p-2">Amount</th>
                                                <th className="p-2">Today</th>
                                                <th className="p-2">1 month ago</th>
                                                <th className="p-2">Change</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {comparisons['1m'].map(row => (
                                                <tr key={row.amount} className="border-b border-gray-700/50">
                                                    <td className="p-2">{row.amount} {coin.toUpperCase()}</td>
                                                    <td className="p-2">${row.currentValue.toFixed(2)}</td>
                                                    <td className="p-2">${row.historicalValue.toFixed(2)}</td>
                                                    <td className={`p-2 ${row.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {row.change.toFixed(2)}%
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* 1 Year Comparison */}
                            <div>
                                <h3 className="text-xl font-bold mb-4">Today vs. 1 year ago</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left border-b border-gray-700">
                                                <th className="p-2">Amount</th>
                                                <th className="p-2">Today</th>
                                                <th className="p-2">1 year ago</th>
                                                <th className="p-2">Change</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {comparisons['1y'].map(row => (
                                                <tr key={row.amount} className="border-b border-gray-700/50">
                                                    <td className="p-2">{row.amount} {coin.toUpperCase()}</td>
                                                    <td className="p-2">${row.currentValue.toFixed(2)}</td>
                                                    <td className="p-2">${row.historicalValue.toFixed(2)}</td>
                                                    <td className={`p-2 ${row.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {row.change.toFixed(2)}%
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column - Market Data */}
                    <div className="space-y-8">
                        {/* Market Stats */}
                        <section className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
                            <h2 className="text-2xl font-bold mb-6">📈 Market Overview</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-700/30 rounded-lg">
                                    <p className="text-sm text-gray-400">Market Cap</p>
                                    <p className="text-lg font-bold">
                                        ${new Intl.NumberFormat('en-US', {
                                            notation: 'compact',
                                            maximumFractionDigits: 2
                                        }).format(selectedCoin.market_cap)}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-700/30 rounded-lg">
                                    <p className="text-sm text-gray-400">24h Volume</p>
                                    <p className="text-lg font-bold">
                                        ${new Intl.NumberFormat('en-US', {
                                            notation: 'compact',
                                            maximumFractionDigits: 2
                                        }).format(selectedCoin.volume_24h)}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-700/30 rounded-lg">
                                    <p className="text-sm text-gray-400">24h Change</p>
                                    <p className={`text-lg font-bold ${
                                        selectedCoin.percent_change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                        {selectedCoin.percent_change_24h >= 0 ? '↗' : '↘'} 
                                        {selectedCoin.percent_change_24h.toFixed(2)}%
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-700/30 rounded-lg">
                                    <p className="text-sm text-gray-400">Circulating Supply</p>
                                    <p className="text-lg font-bold">
                                        {new Intl.NumberFormat('en-US', {
                                            notation: 'compact',
                                            maximumFractionDigits: 2
                                        }).format(selectedCoin.circulating_supply)} {coin.toUpperCase()}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Trading Analysis */}
                        <section className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
                            <h2 className="text-2xl font-bold mb-6">🔍 Market Analysis</h2>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-700/30 rounded-lg">
                                    <h3 className="font-bold text-purple-400">Volume Analysis</h3>
                                    <p className="text-sm text-gray-300 mt-2">
                                        24h volume is {(selectedCoin.volume_24h / selectedCoin.market_cap * 100).toFixed(2)}% 
                                        of market cap, indicating {
                                            selectedCoin.volume_24h > selectedCoin.market_cap 
                                                ? 'very high' 
                                                : selectedCoin.volume_24h > selectedCoin.market_cap * 0.1 
                                                    ? 'moderate' 
                                                    : 'low'
                                        } trading activity.
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-700/30 rounded-lg">
                                    <h3 className="font-bold text-purple-400">Price Movement</h3>
                                    <p className="text-sm text-gray-300 mt-2">
                                        {selectedCoin.name} has moved {
                                            selectedCoin.percent_change_24h >= 0 ? 'up' : 'down'
                                        } {Math.abs(selectedCoin.percent_change_24h).toFixed(2)}% in the last 24 hours,
                                        showing {Math.abs(selectedCoin.percent_change_24h) > 10 ? 'high' : 'normal'} volatility.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Additional Information Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                    {/* Popular Trading Pairs */}
                    <section className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
                        <h2 className="text-2xl font-bold mb-6">💹 Trading Pairs</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { pair: 'USDT', exchange: 'Binance' },
                                { pair: 'BTC', exchange: 'KuCoin' },
                                { pair: 'ETH', exchange: 'Coinbase' },
                                { pair: 'BNB', exchange: 'Binance' }
                            ].map(({ pair, exchange }) => (
                                <div key={pair} className="bg-gray-700/30 p-4 rounded-lg">
                                    <div className="font-bold">{coin.toUpperCase()}/{pair}</div>
                                    <div className="text-sm text-gray-400">{exchange}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Popular Conversions */}
                    <section className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
                        <h2 className="text-2xl font-bold mb-6">🌐 Other Currencies</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'].map(curr => (
                                <a
                                    key={curr}
                                    href={`/converter/${coin.toLowerCase()}/${curr.toLowerCase()}`}
                                    className="p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-all"
                                >
                                    {coin.toUpperCase()} to {curr}
                                </a>
                            ))}
                        </div>
                    </section>
                </div>

                {/* SEO Content Section */}
                <article className="prose prose-invert max-w-none mt-12 bg-gray-800/50 backdrop-blur-md rounded-xl p-8 border border-gray-700/50">
                    <h2 className="text-3xl font-bold mb-6">
                        Convert {selectedCoin?.name || coin.toUpperCase()} to {currency.toUpperCase()}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3>How to Convert {coin.toUpperCase()} to {currency.toUpperCase()}</h3>
                            <ol className="list-decimal list-inside space-y-2">
                                <li>Enter your {coin.toUpperCase()} amount</li>
                                <li>Get instant {currency.toUpperCase()} conversion</li>
                                <li>View real-time market rates</li>
                                <li>Track price changes and market data</li>
                            </ol>
                        </div>
                        
                        <div>
                            <h3>Why Use Our Converter</h3>
                            <ul className="list-disc list-inside space-y-2">
                                <li>Real-time price updates</li>
                                <li>Multiple currency support</li>
                                <li>Detailed market analysis</li>
                                <li>Quick conversion tables</li>
                            </ul>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3>About {selectedCoin?.name || coin.toUpperCase()}</h3>
                        <p>
                            {selectedCoin?.name} ({coin.toUpperCase()}) is currently valued at ${selectedCoin?.price.toFixed(6)} {currency.toUpperCase()}.
                            With a market cap of ${new Intl.NumberFormat('en-US').format(selectedCoin?.market_cap)}, it ranks
                            #{selectedCoin?.rank} among all cryptocurrencies.
                        </p>
                        
                        <h3>Market Performance</h3>
                        <p>
                            In the last 24 hours, {coin.toUpperCase()} has seen a volume of 
                            ${new Intl.NumberFormat('en-US').format(selectedCoin?.volume_24h)} and a price change
                            of {selectedCoin?.percent_change_24h.toFixed(2)}%.
                        </p>
                    </div>
                </article>

                {/* Enhanced FAQ Section */}
                <section className="bg-gray-800/50 backdrop-blur-md rounded-xl p-8 border border-gray-700/50">
                    <h2 className="text-2xl font-bold mb-6">❓ Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        {/* Price Related */}
                        <div>
                            <h3 className="font-bold text-purple-400">
                                What is the current {coin.toUpperCase()} to {currency.toUpperCase()} rate?
                            </h3>
                            <p className="text-sm text-gray-300">
                                Currently, 1 {coin.toUpperCase()} equals ${selectedCoin?.price.toFixed(6)} {currency.toUpperCase()}.
                                This rate is updated in real-time based on market data.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-purple-400">
                                How much {coin.toUpperCase()} can I get for 100 {currency.toUpperCase()}?
                            </h3>
                            <p className="text-sm text-gray-300">
                                With the current rate, 100 {currency.toUpperCase()} will get you approximately {(100 / selectedCoin?.price).toFixed(2)} {coin.toUpperCase()}.
                            </p>
                        </div>

                        {/* Historical Performance */}
                        <div>
                            <h3 className="font-bold text-purple-400">
                                How has {coin.toUpperCase()} performed recently?
                            </h3>
                            <p className="text-sm text-gray-300">
                                {coin.toUpperCase()} has shown {selectedCoin?.percent_change_24h >= 0 ? 'positive' : 'negative'} movement:
                                <br/>• 24h Change: {selectedCoin?.percent_change_24h.toFixed(2)}%
                                <br/>• 7d Change: {selectedCoin?.percent_change_7d.toFixed(2)}%
                                <br/>• 30d Change: {selectedCoin?.percent_change_30d.toFixed(2)}%
                            </p>
                        </div>

                        {/* Market Data */}
                        <div>
                            <h3 className="font-bold text-purple-400">
                                What is {coin.toUpperCase()}'s market position?
                            </h3>
                            <p className="text-sm text-gray-300">
                                {coin.toUpperCase()} has a market cap of ${new Intl.NumberFormat('en-US').format(selectedCoin?.market_cap)},
                                ranking #{selectedCoin?.rank} among all cryptocurrencies. The 24-hour trading volume is 
                                ${new Intl.NumberFormat('en-US').format(selectedCoin?.volume_24h)}.
                            </p>
                        </div>

                        {/* Trading Related */}
                        <div>
                            <h3 className="font-bold text-purple-400">
                                Where can I trade {coin.toUpperCase()}?
                            </h3>
                            <p className="text-sm text-gray-300">
                                {coin.toUpperCase()} can be traded on major cryptocurrency exchanges like Binance, Coinbase, and KuCoin.
                                Always ensure you're using reputable platforms and verify the trading pairs available.
                            </p>
                        </div>

                        {/* Technical */}
                        <div>
                            <h3 className="font-bold text-purple-400">
                                What affects {coin.toUpperCase()} price?
                            </h3>
                            <p className="text-sm text-gray-300">
                                {coin.toUpperCase()} price is influenced by various factors including market sentiment,
                                trading volume (currently ${new Intl.NumberFormat('en-US').format(selectedCoin?.volume_24h)}),
                                overall crypto market conditions, and community engagement.
                            </p>
                        </div>

                        {/* Supply Info */}
                        <div>
                            <h3 className="font-bold text-purple-400">
                                What is {coin.toUpperCase()}'s supply?
                            </h3>
                            <p className="text-sm text-gray-300">
                                {coin.toUpperCase()} has a circulating supply of {new Intl.NumberFormat('en-US').format(selectedCoin?.circulating_supply)} tokens
                                {selectedCoin?.max_supply ? ` with a maximum supply of ${new Intl.NumberFormat('en-US').format(selectedCoin?.max_supply)}` : ' with no maximum supply limit'}.
                            </p>
                        </div>

                        {/* Calculator Usage */}
                        <div>
                            <h3 className="font-bold text-purple-400">
                                How accurate is this converter?
                            </h3>
                            <p className="text-sm text-gray-300">
                                Our converter uses real-time market data and is updated continuously. However, actual trading prices
                                may vary due to factors like exchange fees, liquidity, and market depth.
                            </p>
                        </div>

                        {/* Investment Related */}
                        <div>
                            <h3 className="font-bold text-purple-400">
                                What should I consider before trading {coin.toUpperCase()}?
                            </h3>
                            <p className="text-sm text-gray-300">
                                Consider factors like market volatility (currently {Math.abs(selectedCoin?.percent_change_24h) > 20 ? 'high' : 'moderate'}),
                                trading volume, your risk tolerance, and overall market conditions. Always do your own research and never
                                invest more than you can afford to lose.
                            </p>
                        </div>

                        {/* Price Predictions */}
                        <div>
                            <h3 className="font-bold text-purple-400">
                                How can I track {coin.toUpperCase()} price changes?
                            </h3>
                            <p className="text-sm text-gray-300">
                                You can use our converter for real-time rates, set up price alerts, and monitor market statistics.
                                We provide historical comparisons and detailed market analysis to help track performance.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Disclaimer */}
                <footer className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 text-center">
                    <p className="text-sm text-gray-400">
                        All conversions are based on real-time market data. Actual trading prices may vary.
                        Always verify current rates before making trading decisions.
                    </p>
                </footer>
            </div>
        </div>
    );
} 