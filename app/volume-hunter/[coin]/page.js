import VolumeHunterWrapper from '@/components/VolumeHunterWrapper';

export const metadata = {
    title: 'Volume Analysis | Track Unusual Meme Coin Trading Activity',
    description: 'Detect and analyze unusual trading volume in meme coins. Find potential breakouts and market movements early.',
    keywords: 'volume analysis, trading volume, meme coins, volume spikes, market analysis, unusual volume',
};

const formatVolumeRatio = (volume, marketCap) => {
    if (!marketCap || marketCap === 0 || !volume) return 'N/A';
    const ratio = (volume / marketCap) * 100;
    return ratio > 1000 ? '>1000%' : ratio < 0.01 ? '<0.01%' : `${ratio.toFixed(2)}%`;
};

const formatNumber = (num) => {
    if (!num || isNaN(num)) return 'N/A';
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 2
    }).format(num);
};

export default async function VolumeHunterPage({ params }) {
    const { coin } = params;
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memecoins`);
    const { data: categorizedCoins } = await response.json();
    const allCoins = Object.values(categorizedCoins).flat();
    
    const selectedCoin = allCoins.find(c => 
        c.symbol.toLowerCase() === coin.toLowerCase() ||
        c.slug.toLowerCase() === coin.toLowerCase()
    );

    if (!selectedCoin) {
        return <div>Coin not found</div>;
    }

    console.log('Volume:', selectedCoin.volume_24h);
    console.log('Market Cap:', selectedCoin.market_cap);
    console.log('Ratio:', selectedCoin.volume_24h / selectedCoin.market_cap);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                        {selectedCoin?.name || coin.toUpperCase()} Volume Analysis
                    </h1>
                    <p className="text-xl text-gray-300 mb-2">
                        Track unusual trading volume and price movements
                    </p>
                    <p className="text-sm text-gray-400">
                        Last updated: {new Date().toLocaleTimeString()}
                    </p>
                </header>

                {/* Volume Stats */}
                {selectedCoin && (
                    <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <span className="text-purple-300 block mb-1">24h Volume</span>
                                <span className="text-xl font-bold">
                                    ${formatNumber(selectedCoin.volume_24h)}
                                </span>
                            </div>
                            <div className="text-center">
                                <span className="text-purple-300 block mb-1">Volume/Market Cap</span>
                                <span className="text-xl font-bold">
                                    {formatVolumeRatio(selectedCoin.volume_24h, selectedCoin.market_cap)}
                                </span>
                            </div>
                            <div className="text-center">
                                <span className="text-purple-300 block mb-1">Volume Change</span>
                                <span className={`text-xl font-bold ${
                                    selectedCoin.volume_change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                    {selectedCoin.volume_change_24h?.toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-8">
                        <section className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
                            <h2 className="text-2xl font-bold mb-6">🔥 Volume Analysis</h2>
                            <VolumeHunterWrapper 
                                coins={allCoins}
                                defaultCoin={selectedCoin}
                            />
                        </section>
                    </div>

                    {/* Market Analysis */}
                    <div className="space-y-8">
                        <section className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
                            <h2 className="text-2xl font-bold mb-6">📊 Market Overview</h2>
                            {selectedCoin && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-700/30 rounded-lg">
                                        <p className="text-sm text-gray-400">Current Price</p>
                                        <p className="text-lg font-bold">${selectedCoin.price.toFixed(6)}</p>
                                    </div>
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
                                        <p className="text-sm text-gray-400">24h Change</p>
                                        <p className={`text-lg font-bold ${
                                            selectedCoin.percent_change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                            {selectedCoin.percent_change_24h.toFixed(2)}%
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-700/30 rounded-lg">
                                        <p className="text-sm text-gray-400">Rank</p>
                                        <p className="text-lg font-bold">#{selectedCoin.rank}</p>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                </div>

                {/* Enhanced FAQ Section */}
                <section className="bg-gray-800/50 backdrop-blur-md rounded-xl p-8 border border-gray-700/50">
                    <h2 className="text-2xl font-bold mb-6">❓ Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-bold text-purple-400">
                                What is unusual volume in cryptocurrency?
                            </h3>
                            <p className="text-sm text-gray-300">
                                Unusual volume occurs when trading activity significantly exceeds normal levels,
                                often indicating strong market interest or potential price movements.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-purple-400">
                                How does volume affect {coin.toUpperCase()} price?
                            </h3>
                            <p className="text-sm text-gray-300">
                                Higher trading volume often indicates increased market activity and can lead to
                                larger price movements. Current volume is {formatVolumeRatio(selectedCoin?.volume_24h, selectedCoin?.market_cap)}
                                of market cap.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-purple-400">
                                What is Volume/Market Cap ratio?
                            </h3>
                            <p className="text-sm text-gray-300">
                                The Volume/Market Cap ratio shows how much trading activity there is relative to the coin's size.
                                A ratio over 100% indicates high trading interest, while under 10% suggests lower liquidity.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-purple-400">
                                What causes unusual trading volume?
                            </h3>
                            <p className="text-sm text-gray-300">
                                Unusual volume can be triggered by:
                                <br/>• Major news or announcements
                                <br/>• Large investor (whale) activity
                                <br/>• Market sentiment shifts
                                <br/>• Social media trends
                                <br/>• Project developments
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-purple-400">
                                Is high volume always good?
                            </h3>
                            <p className="text-sm text-gray-300">
                                Not necessarily. While high volume can indicate strong interest, it's important to consider:
                                <br/>• Price direction (up or down)
                                <br/>• Market sentiment
                                <br/>• Historical volume patterns
                                <br/>• Overall market conditions
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-purple-400">
                                How to use volume analysis for trading?
                            </h3>
                            <p className="text-sm text-gray-300">
                                Volume analysis can help:
                                <br/>• Confirm price trends
                                <br/>• Identify potential breakouts
                                <br/>• Spot market manipulation
                                <br/>• Assess trading liquidity
                                <br/>• Time entry/exit points
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-purple-400">
                                What is {coin.toUpperCase()}'s current volume trend?
                            </h3>
                            <p className="text-sm text-gray-300">
                                {coin.toUpperCase()} shows {
                                    selectedCoin?.volume_change_24h > 20 ? 'significantly higher' :
                                    selectedCoin?.volume_change_24h > 0 ? 'slightly higher' :
                                    selectedCoin?.volume_change_24h < -20 ? 'significantly lower' :
                                    'slightly lower'
                                } volume compared to yesterday, with a {Math.abs(selectedCoin?.volume_change_24h).toFixed(2)}% 
                                {selectedCoin?.volume_change_24h >= 0 ? ' increase' : ' decrease'}.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-purple-400">
                                What are volume spikes?
                            </h3>
                            <p className="text-sm text-gray-300">
                                Volume spikes are sudden increases in trading activity that can indicate:
                                <br/>• Strong buying/selling pressure
                                <br/>• Important price levels being tested
                                <br/>• Major market events
                                <br/>• Potential trend reversals
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-purple-400">
                                How often is volume data updated?
                            </h3>
                            <p className="text-sm text-gray-300">
                                Our volume data is updated in real-time from major exchanges. The 24-hour volume
                                is a rolling calculation that includes all trades in the past 24 hours.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Trading Signals Section */}
                <section className="bg-gray-800/50 backdrop-blur-md rounded-xl p-8 border border-gray-700/50">
                    <h2 className="text-2xl font-bold mb-6">🎯 Volume-Based Trading Signals</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-gray-700/30 rounded-lg">
                            <h3 className="font-bold text-purple-400 mb-2">Bullish Signals</h3>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li>• High volume with price increase</li>
                                <li>• Volume above daily average</li>
                                <li>• Strong buy pressure</li>
                                <li>• Increasing market interest</li>
                            </ul>
                        </div>
                        <div className="p-4 bg-gray-700/30 rounded-lg">
                            <h3 className="font-bold text-purple-400 mb-2">Bearish Signals</h3>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li>• High volume with price decrease</li>
                                <li>• Selling pressure dominance</li>
                                <li>• Distribution patterns</li>
                                <li>• Weakening support levels</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Enhanced Volume Analysis Guide */}
                <section className="bg-gray-800/50 backdrop-blur-md rounded-xl p-8 border border-gray-700/50">
                    <h2 className="text-2xl font-bold mb-6">📚 Complete Volume Analysis Guide</h2>
                    <div className="space-y-8">
                        {/* Volume Patterns */}
                        <div>
                            <h3 className="text-xl font-bold text-purple-400 mb-4">Understanding Volume Patterns</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 bg-gray-700/30 rounded-lg">
                                    <h4 className="font-bold mb-2">Current Volume Analysis</h4>
                                    <p className="text-sm text-gray-300">
                                        {selectedCoin?.name} ({coin.toUpperCase()}) shows {
                                            selectedCoin?.volume_24h > selectedCoin?.market_cap * 2 ? 'extremely high' :
                                            selectedCoin?.volume_24h > selectedCoin?.market_cap ? 'very high' :
                                            selectedCoin?.volume_24h > selectedCoin?.market_cap * 0.5 ? 'significant' :
                                            'normal'
                                        } trading activity with:
                                        <br/>• 24h Volume: ${formatNumber(selectedCoin?.volume_24h)}
                                        <br/>• Volume/MCap: {formatVolumeRatio(selectedCoin?.volume_24h, selectedCoin?.market_cap)}
                                        <br/>• Volume Change: {selectedCoin?.volume_change_24h.toFixed(2)}%
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-700/30 rounded-lg">
                                    <h4 className="font-bold mb-2">Pattern Recognition</h4>
                                    <p className="text-sm text-gray-300">
                                        Current pattern indicates:
                                        <br/>• {selectedCoin?.volume_24h > selectedCoin?.market_cap ? 'High liquidity event' : 'Normal trading activity'}
                                        <br/>• {selectedCoin?.volume_change_24h >= 0 ? 'Increasing' : 'Decreasing'} market interest
                                        <br/>• {Math.abs(selectedCoin?.percent_change_24h) > 10 ? 'Volatile' : 'Stable'} price action
                                        <br/>• {selectedCoin?.volume_24h > selectedCoin?.volume_24h * 1.5 ? 'Abnormal' : 'Regular'} trading volume
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Volume Indicators */}
                        <div>
                            <h3 className="text-xl font-bold text-purple-400 mb-4">Key Volume Indicators</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-gray-700/30 rounded-lg">
                                    <h4 className="font-bold mb-2">Volume Metrics</h4>
                                    <ul className="text-sm text-gray-300 space-y-2">
                                        <li>• V/MC Ratio: {formatVolumeRatio(selectedCoin?.volume_24h, selectedCoin?.market_cap)}</li>
                                        <li>• 24h Change: {selectedCoin?.volume_change_24h.toFixed(2)}%</li>
                                        <li>• Market Rank: #{selectedCoin?.rank}</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-gray-700/30 rounded-lg">
                                    <h4 className="font-bold mb-2">Price Impact</h4>
                                    <ul className="text-sm text-gray-300 space-y-2">
                                        <li>• 24h: {selectedCoin?.percent_change_24h.toFixed(2)}%</li>
                                        <li>• 7d: {selectedCoin?.percent_change_7d.toFixed(2)}%</li>
                                        <li>• 30d: {selectedCoin?.percent_change_30d.toFixed(2)}%</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-gray-700/30 rounded-lg">
                                    <h4 className="font-bold mb-2">Market Health</h4>
                                    <ul className="text-sm text-gray-300 space-y-2">
                                        <li>• Liquidity: {selectedCoin?.volume_24h > selectedCoin?.market_cap * 0.1 ? 'High' : 'Low'}</li>
                                        <li>• Volatility: {Math.abs(selectedCoin?.percent_change_24h) > 10 ? 'High' : 'Low'}</li>
                                        <li>• Momentum: {selectedCoin?.percent_change_24h >= 0 ? 'Positive' : 'Negative'}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Trading Strategies */}
                        <div>
                            <h3 className="text-xl font-bold text-purple-400 mb-4">Volume Analysis Strategies</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 bg-gray-700/30 rounded-lg">
                                    <h4 className="font-bold mb-2">Entry Strategies</h4>
                                    <ul className="text-sm text-gray-300 space-y-2">
                                        <li>• Monitor volume breakouts above average</li>
                                        <li>• Look for volume confirmation on price moves</li>
                                        <li>• Track volume/price divergences</li>
                                        <li>• Identify accumulation patterns</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-gray-700/30 rounded-lg">
                                    <h4 className="font-bold mb-2">Risk Management</h4>
                                    <ul className="text-sm text-gray-300 space-y-2">
                                        <li>• Set volume-based stop losses</li>
                                        <li>• Use volume profile for support/resistance</li>
                                        <li>• Monitor liquidity levels</li>
                                        <li>• Watch for distribution patterns</li>
                        </ul>
                                </div>
                            </div>
                        </div>

                        {/* Current Market Analysis */}
                        <div>
                            <h3 className="text-xl font-bold text-purple-400 mb-4">Current Market Analysis</h3>
                            <div className="p-4 bg-gray-700/30 rounded-lg">
                                <p className="text-sm text-gray-300">
                                    Based on current volume analysis, {selectedCoin?.name} shows:
                                    <br/><br/>
                                    • Volume Trend: {
                                        selectedCoin?.volume_change_24h > 20 ? 'Strong increase in trading activity' :
                                        selectedCoin?.volume_change_24h > 0 ? 'Moderate increase in volume' :
                                        selectedCoin?.volume_change_24h < -20 ? 'Significant decrease in activity' :
                                        'Slight decrease in volume'
                                    }
                                    <br/><br/>
                                    • Market Interest: {
                                        selectedCoin?.volume_24h > selectedCoin?.market_cap ? 'Very high market interest with volume exceeding market cap' :
                                        selectedCoin?.volume_24h > selectedCoin?.market_cap * 0.5 ? 'Strong market interest with significant volume' :
                                        'Normal market interest with moderate volume'
                                    }
                                    <br/><br/>
                                    • Trading Activity: Volume is {((selectedCoin?.volume_24h / selectedCoin?.market_cap) * 100).toFixed(2)}% 
                                    of market cap, indicating {
                                        selectedCoin?.volume_24h > selectedCoin?.market_cap ? 'extremely high' :
                                        selectedCoin?.volume_24h > selectedCoin?.market_cap * 0.5 ? 'above average' :
                                        'normal'
                                    } trading activity.
                                    <br/><br/>
                                    • Price Impact: {
                                        Math.abs(selectedCoin?.percent_change_24h) > 20 ? 'High volatility with significant price movement' :
                                        Math.abs(selectedCoin?.percent_change_24h) > 10 ? 'Moderate volatility with notable price changes' :
                                        'Low volatility with stable price action'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Market Insights */}
                <section className="bg-gray-800/50 backdrop-blur-md rounded-xl p-8 border border-gray-700/50">
                    <h2 className="text-2xl font-bold mb-6">🔍 Market Insights</h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-purple-400 mb-3">Current Market Scenario</h3>
                            <p className="text-gray-300">
                                {selectedCoin?.name} is currently showing {
                                    selectedCoin?.volume_24h > selectedCoin?.market_cap ? 'extremely high' :
                                    selectedCoin?.volume_24h > selectedCoin?.market_cap * 0.5 ? 'significant' :
                                    'moderate'
                                } trading activity. The volume to market cap ratio suggests {
                                    selectedCoin?.volume_24h > selectedCoin?.market_cap ? 'potential market moving events' :
                                    'typical trading conditions'
                                }.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-purple-400 mb-3">Volume Analysis</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-700/30 rounded-lg">
                                    <h4 className="font-bold mb-2">Buying Pressure</h4>
                                    <p className="text-sm text-gray-300">
                                        {selectedCoin?.percent_change_24h >= 0 
                                            ? 'Strong buying pressure with positive price action'
                                            : 'Weak buying pressure with negative price movement'}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-700/30 rounded-lg">
                                    <h4 className="font-bold mb-2">Volume Trend</h4>
                                    <p className="text-sm text-gray-300">
                                        Volume has {selectedCoin?.volume_change_24h >= 0 ? 'increased' : 'decreased'} by
                                        {Math.abs(selectedCoin?.volume_change_24h).toFixed(2)}% in the last 24 hours
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Related Tools */}
                <section className="bg-gray-800/50 backdrop-blur-md rounded-xl p-8 border border-gray-700/50">
                    <h2 className="text-2xl font-bold mb-6">🛠️ Related Trading Tools</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <a href={`/converter/${coin.toLowerCase()}/usd`} className="p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-all">
                            <h3 className="font-bold text-purple-400">💱 Price Converter</h3>
                            <p className="text-sm text-gray-300 mt-2">Convert {coin.toUpperCase()} to USD and other currencies</p>
                        </a>
                        <a href="/tools/moon-calculator" className="p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-all">
                            <h3 className="font-bold text-purple-400">🌙 Profit Calculator</h3>
                            <p className="text-sm text-gray-300 mt-2">Calculate potential returns and profit targets</p>
                        </a>
                        <a href="/tools/meme-battle" className="p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-all">
                            <h3 className="font-bold text-purple-400">⚔️ Compare Coins</h3>
                            <p className="text-sm text-gray-300 mt-2">Compare {coin.toUpperCase()} with other meme coins</p>
                        </a>
                    </div>
                </section>

                {/* Rich Snippets for SEO */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'FinancialProduct',
                            name: `${selectedCoin?.name} Volume Analysis`,
                            description: `Real-time volume analysis and trading insights for ${selectedCoin?.name} (${coin.toUpperCase()})`,
                            url: `https://your-domain.com/volume-hunter/${coin.toLowerCase()}`,
                            provider: {
                                '@type': 'Organization',
                                name: 'Meme Coin Universe',
                                url: 'https://your-domain.com'
                            },
                            additionalProperty: [
                                {
                                    '@type': 'PropertyValue',
                                    name: '24h Volume',
                                    value: selectedCoin?.volume_24h
                                },
                                {
                                    '@type': 'PropertyValue',
                                    name: 'Market Cap',
                                    value: selectedCoin?.market_cap
                                },
                                {
                                    '@type': 'PropertyValue',
                                    name: 'Volume Change',
                                    value: `${selectedCoin?.volume_change_24h}%`
                                }
                            ]
                        })
                    }}
                />

                {/* Disclaimer */}
                <footer className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 text-center">
                    <p className="text-sm text-gray-400">
                        Volume analysis and predictions are based on historical data and current market conditions.
                        Always conduct your own research before making trading decisions.
                    </p>
                </footer>
            </div>
        </div>
    );
} 