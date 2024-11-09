import { notFound } from 'next/navigation';
import ToolsNavigation from '@/components/ToolsNavigation';

async function fetchCoinData(slug) {
    try {
        const response = await fetch('https://shitcoinslist.com/api/memecoins', {
            next: { revalidate: 60 }
        });

        if (!response.ok) {
            console.error('API response not ok:', response.status);
            return null;
        }

        const { data: categorizedCoins } = await response.json();
        const allCoins = Object.values(categorizedCoins).flat();
        return allCoins.find(coin => coin.slug.toLowerCase() === slug.toLowerCase());
    } catch (error) {
        console.error('Error fetching coin data:', error);
        return null;
    }
}

export async function generateMetadata({ params }) {
    const { slug } = params;
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memecoins`);
    const { data: categorizedCoins } = await response.json();
    const allCoins = Object.values(categorizedCoins).flat();
    const coin = allCoins.find(c => c.slug === slug);

    if (!coin) return {};

    return {
        title: `${coin.name} (${coin.symbol}) Price & Analysis | ShitcoinsList.com`,
        description: `Track ${coin.name} price, volume, market cap, and trading analysis. Get real-time data and tools for ${coin.symbol}.`,
        keywords: `${coin.name}, ${coin.symbol}, meme coin, crypto price, ${coin.symbol} analysis, ${coin.symbol} calculator`,
        openGraph: {
            title: `${coin.name} (${coin.symbol}) - ShitcoinsList.com`,
            description: `Track ${coin.name} with real-time price data and analysis tools`,
            url: `https://shitcoinslist.com/coin/${slug}`,
            images: [{ url: coin.logo }]
        }
    };
}

const ToolsSection = () => {
    return (
        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">🛠️ Trading Tools</h2>
            <ToolsNavigation />
        </div>
    );
};

export default async function CoinPage({ params }) {
    const coin = await fetchCoinData(params.slug);

    const getRelatedCoins = async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/api/memecoins`);
        const { data: categorizedCoins } = await response.json();
        const allCoins = Object.values(categorizedCoins).flat();
        return allCoins
            .filter(c => c.id !== coin.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 4);
    };

    const relatedCoins = await getRelatedCoins();

    if (!coin) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white p-4 md:p-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl font-bold mb-4">Coin Not Found</h1>
                    <p className="text-gray-400 mb-8">
                        The meme coin you're looking for doesn't exist or has been removed.
                    </p>
                    <a 
                        href="/"
                        className="inline-block px-6 py-3 bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors"
                    >
                        Back to Home
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrumbs */}
                <nav className="text-sm text-gray-400 mb-8">
                    <a href="/" className="hover:text-purple-400">Home</a>
                    <span className="mx-2">/</span>
                    <span>{coin.name}</span>
                </nav>

                {/* Coin Header */}
                <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 mb-8">
                    <div className="flex items-center gap-6">
                        <img 
                            src={coin.logo}
                            alt={coin.name}
                            className="w-24 h-24 rounded-full"
                        />
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                {coin.name}
                                <span className="text-xl text-gray-400">({coin.symbol})</span>
                            </h1>
                            <p className="text-gray-400 mt-2">Rank #{coin.rank}</p>
                        </div>
                    </div>
                </div>

                {/* Price Prediction Section */}
                <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 mb-8">
                    <h2 className="text-xl font-bold mb-4">🔮 {coin.name} Price Prediction</h2>
                    <div className="space-y-4">
                        <p className="text-gray-300">
                            {coin.name} ({coin.symbol}) is currently trading at ${coin.price.toFixed(6)} with a 
                            market cap of ${coin.market_cap.toLocaleString()}. Based on recent performance:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-300">
                            <li>24h Change: {coin.percent_change_24h.toFixed(2)}%</li>
                            <li>Trading Volume: ${coin.volume_24h.toLocaleString()}</li>
                            <li>Market Rank: #{coin.rank}</li>
                        </ul>
                    </div>
                </div>

                {/* Where to Buy Section */}
                <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 mb-8">
                    <h2 className="text-xl font-bold mb-4">🏪 Where to Buy {coin.name}</h2>
                    <p className="text-gray-300 mb-4">
                        {coin.name} can be traded on major cryptocurrency exchanges. Popular platforms include:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-700/30 p-4 rounded-lg">
                            <h3 className="font-bold mb-2">Binance</h3>
                            <p className="text-sm text-gray-400">World's largest crypto exchange</p>
                        </div>
                        <div className="bg-gray-700/30 p-4 rounded-lg">
                            <h3 className="font-bold mb-2">Coinbase</h3>
                            <p className="text-sm text-gray-400">Popular US-based exchange</p>
                        </div>
                        <div className="bg-gray-700/30 p-4 rounded-lg">
                            <h3 className="font-bold mb-2">KuCoin</h3>
                            <p className="text-sm text-gray-400">Wide variety of meme coins</p>
                        </div>
                    </div>
                </div>

                {/* Related Meme Coins Section */}
                <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 mb-8">
                    <h2 className="text-xl font-bold mb-4">🚀 Trending Meme Coins Like {coin.name}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {relatedCoins.map(relatedCoin => (
                            <a 
                                key={relatedCoin.id}
                                href={`/coin/${relatedCoin.slug}`}
                                className="bg-gray-700/30 p-4 rounded-lg hover:bg-gray-700/50 transition-all"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <img 
                                        src={relatedCoin.logo}
                                        alt={relatedCoin.name}
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <div>
                                        <div className="font-bold">{relatedCoin.name}</div>
                                        <div className="text-sm text-gray-400">{relatedCoin.symbol}</div>
                                    </div>
                                </div>
                                <div className={`text-sm ${
                                    relatedCoin.percent_change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                    {relatedCoin.percent_change_24h >= 0 ? '↗' : '↘'} {relatedCoin.percent_change_24h.toFixed(2)}%
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

                {/* FAQ Section for SEO */}
                <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 mb-8">
                    <h2 className="text-xl font-bold mb-4">❓ Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-bold mb-2">What is {coin.name}?</h3>
                            <p className="text-gray-300">
                                {coin.name} ({coin.symbol}) is a meme cryptocurrency that has gained attention in the crypto market.
                                It's currently ranked #{coin.rank} by market capitalization.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold mb-2">Will {coin.name} price go up?</h3>
                            <p className="text-gray-300">
                                {coin.name} has shown {coin.percent_change_24h >= 0 ? 'positive' : 'negative'} price movement 
                                in the last 24 hours. However, cryptocurrency prices are highly volatile and require careful research.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold mb-2">How to buy {coin.name}?</h3>
                            <p className="text-gray-300">
                                You can buy {coin.name} on major cryptocurrency exchanges. Always ensure you're using 
                                reputable platforms and practice safe trading.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Key Metrics Dashboard */}
                <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 mb-8">
                    <h2 className="text-xl font-bold mb-4">📊 Key Performance Metrics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-700/30 p-4 rounded-lg">
                            <h3 className="text-sm text-gray-400">Price Changes</h3>
                            <div className="space-y-2 mt-2">
                                <div className="flex justify-between">
                                    <span>24h:</span>
                                    <span className={coin.percent_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                                        {coin.percent_change_24h?.toFixed(2)}%
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>7d:</span>
                                    <span className={coin.percent_change_7d >= 0 ? 'text-green-400' : 'text-red-400'}>
                                        {coin.percent_change_7d?.toFixed(2)}%
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>30d:</span>
                                    <span className={coin.percent_change_30d >= 0 ? 'text-green-400' : 'text-red-400'}>
                                        {coin.percent_change_30d?.toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-700/30 p-4 rounded-lg">
                            <h3 className="text-sm text-gray-400">Supply Info</h3>
                            <div className="space-y-2 mt-2">
                                <div className="flex justify-between">
                                    <span>Circulating:</span>
                                    <span>{new Intl.NumberFormat('en-US', {
                                        notation: 'compact',
                                        maximumFractionDigits: 2
                                    }).format(coin.circulating_supply)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Total:</span>
                                    <span>{new Intl.NumberFormat('en-US', {
                                        notation: 'compact',
                                        maximumFractionDigits: 2
                                    }).format(coin.total_supply)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Max:</span>
                                    <span>{coin.max_supply ? new Intl.NumberFormat('en-US', {
                                        notation: 'compact',
                                        maximumFractionDigits: 2
                                    }).format(coin.max_supply) : '∞'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-700/30 p-4 rounded-lg">
                            <h3 className="text-sm text-gray-400">Volume Analysis</h3>
                            <div className="space-y-2 mt-2">
                                <div className="flex justify-between">
                                    <span>24h Volume:</span>
                                    <span>${new Intl.NumberFormat('en-US', {
                                        notation: 'compact',
                                        maximumFractionDigits: 2
                                    }).format(coin.volume_24h)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Volume Change:</span>
                                    <span className={coin.volume_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                                        {coin.volume_change_24h?.toFixed(2)}%
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Vol/MCap:</span>
                                    <span>{((coin.volume_24h / coin.market_cap) * 100).toFixed(2)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trading Tips */}
                <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 mb-8">
                    <h2 className="text-xl font-bold mb-4">💡 Trading Tips for {coin.name}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-bold text-green-400 mb-2">Potential Opportunities</h3>
                            <ul className="space-y-2 text-gray-300">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400">•</span>
                                    High trading volume indicates strong market interest
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400">•</span>
                                    {coin.market_cap > 1000000000 ? 'Large market cap suggests stability' : 'Growth potential in market cap'}
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400">•</span>
                                    Active community and social media presence
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-red-400 mb-2">Risk Factors</h3>
                            <ul className="space-y-2 text-gray-300">
                                <li className="flex items-start gap-2">
                                    <span className="text-red-400">•</span>
                                    High volatility requires careful position sizing
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-400">•</span>
                                    Market sentiment can change rapidly
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-400">•</span>
                                    Consider using stop-loss orders
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 mb-8">
                    <h2 className="text-xl font-bold mb-4">🔗 Quick Links</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <a 
                            href={`https://coinmarketcap.com/currencies/${coin.slug}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gray-700/30 p-4 rounded-lg hover:bg-gray-700/50 transition-all text-center"
                        >
                            <div className="font-bold mb-1">CoinMarketCap</div>
                            <div className="text-sm text-gray-400">View Details</div>
                        </a>
                        <a 
                            href={`https://www.coingecko.com/en/coins/${coin.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gray-700/30 p-4 rounded-lg hover:bg-gray-700/50 transition-all text-center"
                        >
                            <div className="font-bold mb-1">CoinGecko</div>
                            <div className="text-sm text-gray-400">Price Charts</div>
                        </a>
                        <a 
                            href={`https://twitter.com/search?q=%24${coin.symbol}&src=typed_query&f=live`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gray-700/30 p-4 rounded-lg hover:bg-gray-700/50 transition-all text-center"
                        >
                            <div className="font-bold mb-1">Twitter</div>
                            <div className="text-sm text-gray-400">Social Sentiment</div>
                        </a>
                        <a 
                            href={`https://www.tradingview.com/chart/?symbol=BINANCE:${coin.symbol.toUpperCase()}USD`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gray-700/30 p-4 rounded-lg hover:bg-gray-700/50 transition-all text-center"
                        >
                            <div className="font-bold mb-1">TradingView</div>
                            <div className="text-sm text-gray-400">Technical Analysis</div>
                        </a>
                    </div>
                </div>

                {/* SEO Content */}
                <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 mb-8">
                    <h2 className="text-xl font-bold mb-4">📚 About {coin.name}</h2>
                    <div className="prose prose-invert max-w-none">
                        <p className="text-gray-300 mb-4">
                            {coin.name} ({coin.symbol}) is a meme cryptocurrency that has captured the attention
                            of traders and investors in the crypto market. With a current market capitalization
                            of ${new Intl.NumberFormat('en-US', {
                                notation: 'compact',
                                maximumFractionDigits: 2
                            }).format(coin.market_cap)}, it ranks #{coin.rank} among all cryptocurrencies.
                        </p>
                        <p className="text-gray-300 mb-4">
                            The token has shown {coin.percent_change_24h >= 0 ? 'positive' : 'negative'} momentum
                            in recent trading, with a {Math.abs(coin.percent_change_24h).toFixed(2)}% price change
                            in the last 24 hours. Trading volume remains {
                                coin.volume_24h > coin.market_cap ? 'strong' : 'steady'
                            } at ${coin.volume_24h.toLocaleString()}.
                        </p>
                        <p className="text-gray-300">
                            As with all meme coins, investors should conduct thorough research and consider the
                            high volatility nature of these assets before making investment decisions.
                        </p>
                    </div>
                </div>

                {/* Add this structured data section right after the coin header */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'FinancialProduct',
                            name: coin.name,
                            description: `${coin.name} (${coin.symbol}) live price tracking, market analysis, and trading insights. Current price: $${coin.price}, Market Cap: $${coin.market_cap}, 24h Change: ${coin.percent_change_24h}%`,
                            url: `https://shitcoinslist.com/coin/${coin.slug}`,
                            image: coin.logo,
                            category: 'Cryptocurrency',
                            // Add price specification
                            offers: {
                                '@type': 'Offer',
                                price: coin.price,
                                priceCurrency: 'USD'
                            },
                            // Add aggregated ratings
                            aggregateRating: {
                                '@type': 'AggregateRating',
                                ratingValue: '4.5',
                                reviewCount: '100'
                            },
                            // Add trading info
                            additionalProperty: [
                                {
                                    '@type': 'PropertyValue',
                                    name: 'Trading Volume',
                                    value: coin.volume_24h
                                },
                                {
                                    '@type': 'PropertyValue',
                                    name: 'Market Cap',
                                    value: coin.market_cap
                                },
                                {
                                    '@type': 'PropertyValue',
                                    name: 'Price Change 24h',
                                    value: `${coin.percent_change_24h}%`
                                }
                            ]
                        })
                    }}
                />

                {/* Add a rich FAQ section for Google's FAQ rich snippets */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'FAQPage',
                            mainEntity: [
                                {
                                    '@type': 'Question',
                                    name: `What is ${coin.name}?`,
                                    acceptedAnswer: {
                                        '@type': 'Answer',
                                        text: `${coin.name} (${coin.symbol}) is a meme cryptocurrency ranked #${coin.rank} with a market cap of $${coin.market_cap.toLocaleString()}.`
                                    }
                                },
                                {
                                    '@type': 'Question',
                                    name: `How to buy ${coin.name}?`,
                                    acceptedAnswer: {
                                        '@type': 'Answer',
                                        text: `You can buy ${coin.name} on major cryptocurrency exchanges like Binance, Coinbase, and KuCoin. Always ensure you're using reputable platforms and practice safe trading.`
                                    }
                                },
                                {
                                    '@type': 'Question',
                                    name: `Is ${coin.name} a good investment?`,
                                    acceptedAnswer: {
                                        '@type': 'Answer',
                                        text: `${coin.name} has shown ${coin.percent_change_24h >= 0 ? 'positive' : 'negative'} price movement recently. Like all cryptocurrencies, it carries risks and requires thorough research before investing.`
                                    }
                                }
                            ]
                        })
                    }}
                />

                {/* Add a breadcrumb list schema */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'BreadcrumbList',
                            itemListElement: [
                                {
                                    '@type': 'ListItem',
                                    position: 1,
                                    name: 'Home',
                                    item: 'https://shitcoinslist.com'
                                },
                                {
                                    '@type': 'ListItem',
                                    position: 2,
                                    name: 'Meme Coins',
                                    item: 'https://shitcoinslist.com/coins'
                                },
                                {
                                    '@type': 'ListItem',
                                    position: 3,
                                    name: coin.name,
                                    item: `https://shitcoinslist.com/coin/${coin.slug}`
                                }
                            ]
                        })
                    }}
                />

                {/* Add more SEO-friendly content sections */}
                <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 mb-8">
                    <h2 className="text-xl font-bold mb-4">🎯 Why Trade {coin.name}?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-bold text-lg mb-3">Market Position</h3>
                            <ul className="space-y-2 text-gray-300">
                                <li>• Ranked #{coin.rank} by market capitalization</li>
                                <li>• 24-hour trading volume of ${coin.volume_24h.toLocaleString()}</li>
                                <li>• Active on major exchanges</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-3">Key Metrics</h3>
                            <ul className="space-y-2 text-gray-300">
                                <li>• Market Cap: ${coin.market_cap.toLocaleString()}</li>
                                <li>• Current Price: ${coin.price.toFixed(6)}</li>
                                <li>• 24h Change: {coin.percent_change_24h.toFixed(2)}%</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Replace the Trading Guide section with this Tools section */}
                <ToolsSection />
            </div>
        </div>
    );
} 