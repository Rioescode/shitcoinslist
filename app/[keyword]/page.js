'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const formatPrice = (price) => {
    if (price === null || price === undefined) return '$0.00';
    
    if (price < 0.00000001) {
        const zeros = Math.floor(Math.abs(Math.log10(price))) - 1;
        return `$0.${'0'.repeat(zeros)}${(price * Math.pow(10, zeros + 1)).toFixed(2)}`;
    }
    
    if (price < 0.0001) return `$${price.toFixed(8)}`;
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    if (price < 1000) return `$${price.toFixed(2)}`;
    
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 2
    }).format(price);
};

const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 2
    }).format(num);
};

const KEYWORD_CONTENT = {
    'shitcoins': {
        title: '🔥 Top Shitcoins List 2024',
        description: 'Live prices and rankings for the best shitcoins to buy',
        heading: 'Live Shitcoin Prices',
        subheading: 'Real-time rankings of the top meme coins by market cap'
    },
    'shitcoin-crypto': {
        title: '🚀 Best Shitcoin Crypto 2024',
        description: 'Top shitcoin cryptocurrencies to trade now',
        heading: 'Top Shitcoin Rankings',
        subheading: 'Live prices for the best shitcoin opportunities'
    },
    'new-shitcoins': {
        title: '💫 New Shitcoins 2024',
        description: 'Latest shitcoin launches and opportunities',
        heading: 'New Shitcoin Listings',
        subheading: 'Track the newest meme coins and early launches'
    },
    'best-shitcoins': {
        title: '⭐ Best Shitcoins 2024',
        description: 'Top performing shitcoins to invest in',
        heading: 'Best Shitcoin Rankings',
        subheading: 'Most profitable meme coins by performance'
    },
    'shitcoins-list': {
        title: '📊 Shitcoins List 2024',
        description: 'Full list of tradeable shitcoins with live data',
        heading: 'All Shitcoins',
        subheading: 'Comprehensive list of active meme coins'
    },
    'shitcoins-to-buy': {
        title: '💎 Top Shitcoins to Buy 2024',
        description: 'Best shitcoin investment opportunities now',
        heading: 'Best Buying Opportunities',
        subheading: 'Most promising meme coins to invest in'
    },
    'shitcoin-trading': {
        title: '📈 Shitcoin Trading Guide 2024',
        description: 'How to trade shitcoins profitably',
        heading: 'Shitcoin Trading',
        subheading: 'Live market data and trading insights'
    },
    'shitcoins-price': {
        title: '💰 Live Shitcoin Prices 2024',
        description: 'Real-time shitcoin price tracking',
        heading: 'Live Prices',
        subheading: 'Up-to-the-minute meme coin valuations'
    },
    'best-shitcoins-to-buy-in-2024': {
        title: '🔥 Best Shitcoins To Buy in 2024',
        description: 'Top shitcoin opportunities for 2024',
        heading: 'Best Shitcoins To Buy',
        subheading: 'Most promising meme coins to invest in 2024'
    }
};

const EXCHANGE_LINKS = {
    binance: {
        name: 'Binance',
        url: 'https://www.binance.com/en/markets/memecoins',
        description: 'Largest shitcoins listing'
    },
    uniswap: {
        name: 'Uniswap',
        url: 'https://app.uniswap.org/#/swap',
        description: 'New shitcoin launches'
    },
    pancakeswap: {
        name: 'PancakeSwap',
        url: 'https://pancakeswap.finance/swap',
        description: 'BSC shitcoins'
    },
    gateio: {
        name: 'Gate.io',
        url: 'https://www.gate.io/new-crypto-listings',
        description: 'Early listings'
    },
    dextools: {
        name: 'DexTools',
        url: 'https://www.dextools.io/app/en/pairs',
        description: 'Track new launches'
    },
    dexscreener: {
        name: 'DexScreener',
        url: 'https://dexscreener.com/new-pairs',
        description: 'New pair listings'
    }
};

const getFAQContent = (keyword) => {
    const cleanKeyword = keyword.replace(/-/g, ' ');
    
    return [
        {
            question: `What are ${cleanKeyword}?`,
            answer: `${cleanKeyword} are cryptocurrency tokens that started as memes or jokes. While many have limited utility, some gain significant value through community support and trading volume.`
        },
        {
            question: `Are ${cleanKeyword} a good investment?`,
            answer: `${cleanKeyword} are extremely high-risk investments. While some traders make profits, most ${cleanKeyword} can lose value quickly. Never invest more than you can afford to lose.`
        },
        {
            question: `How do I find new ${cleanKeyword}?`,
            answer: `New ${cleanKeyword} can be found through DexTools, CoinMarketCap's new listings, crypto Twitter influencers, and Telegram groups. Always research thoroughly before investing.`
        },
        {
            question: `Which exchange is best for ${cleanKeyword}?`,
            answer: `Popular exchanges for ${cleanKeyword} include Binance for established tokens, Uniswap for ETH-based tokens, and PancakeSwap for BSC tokens. Each platform offers different coins and features.`
        },
        {
            question: `How do I spot potential ${cleanKeyword} scams?`,
            answer: `Watch for red flags like anonymous teams, locked liquidity, unrealistic promises, and copied code. Always check contract audits and community sentiment before investing in ${cleanKeyword}.`
        },
        {
            question: `What makes ${cleanKeyword} successful?`,
            answer: `Successful ${cleanKeyword} often have strong community engagement, high trading volume, active developers, and viral social media presence. Marketing and timing also play crucial roles.`
        },
        {
            question: `When is the best time to buy ${cleanKeyword}?`,
            answer: `The best opportunities for ${cleanKeyword} often come during early launches or market dips. However, timing the market is extremely difficult. Always use proper risk management.`
        },
        {
            question: `How do I store ${cleanKeyword} safely?`,
            answer: `Use trusted wallets like MetaMask for ETH-based ${cleanKeyword} or Trust Wallet for BSC ${cleanKeyword}. Always double-check contract addresses and never share your private keys.`
        }
    ];
};

const TRADING_GUIDES = [
    {
        title: "Volume Analysis",
        content: "High trading volume compared to market cap often indicates strong market interest. Look for coins with consistent volume growth."
    },
    {
        title: "Social Signals",
        content: "Monitor Twitter mentions, Telegram group size, and overall social media engagement to gauge community strength."
    },
    {
        title: "Market Timing",
        content: "Best entries often come during market dips or just after new exchange listings. Watch for accumulation patterns."
    }
];

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 24) {
        // Show hours ago if less than 24 hours
        return `${diffHours} hours ago`;
    } else {
        // Show date otherwise
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
};

export default function KeywordPage() {
    const params = useParams();
    const keyword = params.keyword || 'shitcoins';
    const content = KEYWORD_CONTENT[keyword] || KEYWORD_CONTENT['shitcoins'];
    
    const [coins, setCoins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('date_added');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        const fetchCoins = async () => {
            try {
                const response = await fetch('/api/newmemecoins');
                const data = await response.json();
                
                if (data.error) throw new Error(data.error);
                
                // Use the new memecoins data directly
                if (data.status === 'success' && Array.isArray(data.data)) {
                    // Sort by date_added to show newest first
                    const sortedCoins = data.data
                        .sort((a, b) => new Date(b.date_added) - new Date(a.date_added))
                        .slice(0, 50); // Get top 50 newest coins
                    
                    setCoins(sortedCoins);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCoins();
    }, []);

    const getFilteredCoins = () => {
        let filtered = [...coins];
        
        // Apply filters
        switch(filterType) {
            case 'gainers':
                filtered = filtered.filter(coin => coin.percent_change_24h > 0);
                break;
            case 'losers':
                filtered = filtered.filter(coin => coin.percent_change_24h < 0);
                break;
            case 'high_volume':
                filtered = filtered.filter(coin => coin.volume_24h > coin.market_cap * 0.3);
                break;
            case 'low_cap':
                filtered = filtered.filter(coin => coin.market_cap < 10000000); // Under $10M
                break;
        }

        // Apply sorting
        return filtered.sort((a, b) => {
            let comparison = 0;
            switch(sortBy) {
                case 'date_added':
                    comparison = new Date(b.date_added) - new Date(a.date_added);
                    break;
                case 'percent_change_24h':
                    comparison = b.percent_change_24h - a.percent_change_24h;
                    break;
                case 'market_cap':
                    comparison = b.market_cap - a.market_cap;
                    break;
                case 'volume_24h':
                    comparison = b.volume_24h - a.volume_24h;
                    break;
            }
            return sortOrder === 'desc' ? comparison : -comparison;
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center justify-center">
                <div className="loading-container">
                    <span className="stars">✨</span>
                    <span className="stars">✨</span>
                    <span className="stars">✨</span>
                    <span className="animate-rocket">🚀</span>
                </div>
                <div className="mt-4 text-2xl font-bold">Loading {content.title}...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
                <div className="text-xl text-red-500">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20 pt-20">
                    <h1 className="text-5xl font-bold mb-6">{content.title}</h1>
                    <p className="text-xl text-gray-300 mb-8">{content.description}</p>
                </div>

                <div className="mb-12 space-y-8">
                    <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-8"> 
                        <p className="text-lg leading-relaxed">
                            {content.description} Track live prices, market caps, and trading volume for the top meme coins. Our real-time data helps you find the best opportunities in the shitcoin market.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6">
                            <h2 className="text-xl font-bold mb-4">Where to Buy Shitcoins 💰</h2>
                            <div className="grid gap-3">
                                {Object.values(EXCHANGE_LINKS).map((exchange) => (
                                    <a
                                        key={exchange.name}
                                        href={exchange.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-all group"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-purple-400">•</span>
                                            <span className="font-medium">{exchange.name}</span>
                                            <span className="text-sm text-gray-400">- {exchange.description}</span>
                                        </div>
                                        <span className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            Visit →
                                        </span>
                                    </a>
                                ))}
                            </div>
                            
                            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                <p className="text-sm text-yellow-200">
                                    ⚠️ Always verify exchange URLs and use official links to avoid scams
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6">
                            <h2 className="text-xl font-bold mb-4">Shitcoin Trading Tips 📊</h2>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2">
                                    <span className="text-purple-400">•</span>
                                    Check trading volume
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-purple-400">•</span>
                                    Join Telegram groups
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-purple-400">•</span>
                                    Monitor social trends
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-purple-400">•</span>
                                    Research new listings
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6">
                            <h2 className="text-xl font-bold mb-2">🚀 Best Time to Buy</h2>
                            <p>Track new shitcoin listings and early launches</p>
                        </div>

                        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6">
                            <h2 className="text-xl font-bold mb-2">👥 Community</h2>
                            <p>Join shitcoin trading Telegram groups</p>
                        </div>

                        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6">
                            <h2 className="text-xl font-bold mb-2">📈 Price Action</h2>
                            <p>Monitor shitcoins price movements</p>
                        </div>
                    </div>
                </div>

                <div className="mb-8 bg-gray-800/50 backdrop-blur-md rounded-xl p-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                            <button
                                onClick={() => setFilterType('all')}
                                className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                                    filterType === 'all' 
                                        ? 'bg-purple-500 text-white' 
                                        : 'bg-gray-700/50 hover:bg-gray-700'
                                }`}
                            >
                                All Coins
                            </button>
                            <button
                                onClick={() => setFilterType('gainers')}
                                className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                                    filterType === 'gainers' 
                                        ? 'bg-green-500 text-white' 
                                        : 'bg-gray-700/50 hover:bg-gray-700'
                                }`}
                            >
                                🚀 Gainers
                            </button>
                            <button
                                onClick={() => setFilterType('losers')}
                                className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                                    filterType === 'losers' 
                                        ? 'bg-red-500 text-white' 
                                        : 'bg-gray-700/50 hover:bg-gray-700'
                                }`}
                            >
                                💥 Dips
                            </button>
                            <button
                                onClick={() => setFilterType('high_volume')}
                                className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                                    filterType === 'high_volume' 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-gray-700/50 hover:bg-gray-700'
                                }`}
                            >
                                🌊 High Volume
                            </button>
                            <button
                                onClick={() => setFilterType('low_cap')}
                                className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                                    filterType === 'low_cap' 
                                        ? 'bg-yellow-500 text-white' 
                                        : 'bg-gray-700/50 hover:bg-gray-700'
                                }`}
                            >
                                💎 Low Cap
                            </button>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-gray-700/50 rounded-lg px-4 py-2 flex-1 md:flex-none"
                            >
                                <option value="date_added">Latest</option>
                                <option value="percent_change_24h">24h Change</option>
                                <option value="market_cap">Market Cap</option>
                                <option value="volume_24h">Volume</option>
                            </select>
                            <button
                                onClick={() => setSortOrder(order => order === 'desc' ? 'asc' : 'desc')}
                                className="bg-gray-700/50 hover:bg-gray-700 px-4 py-2 rounded-lg"
                            >
                                {sortOrder === 'desc' ? '↓' : '↑'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6">
                    {getFilteredCoins().map((coin, index) => (
                        <div 
                            key={coin.id}
                            className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 hover:bg-gray-800/70 transition-all
                                border border-gray-700/50 hover:border-purple-500/50"
                        >
                            <div className="flex items-center gap-6">
                                <div className="text-2xl font-bold text-purple-400 w-8">
                                    #{index + 1}
                                </div>
                                
                                <img 
                                    src={coin.logo}
                                    alt={coin.name}
                                    className="w-16 h-16 rounded-full"
                                />
                                
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold">{coin.name}</h2>
                                    <p className="text-purple-400">{coin.symbol}</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Listed: {formatDate(coin.date_added)}
                                    </p>
                                </div>
                                
                                <div className="text-right">
                                    <div className="text-2xl font-bold">{formatPrice(coin.price)}</div>
                                    <div className={`text-lg ${
                                        coin.percent_change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                        {coin.percent_change_24h >= 0 ? '↗' : '↘'} {
                                            Math.abs(coin.percent_change_24h).toFixed(2)
                                        }%
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                <div className="bg-gray-700/30 p-4 rounded-lg">
                                    <div className="text-gray-400 text-sm">Market Cap</div>
                                    <div className="font-bold">${formatNumber(coin.market_cap)}</div>
                                </div>
                                <div className="bg-gray-700/30 p-4 rounded-lg">
                                    <div className="text-gray-400 text-sm">Volume 24h</div>
                                    <div className="font-bold">${formatNumber(coin.volume_24h)}</div>
                                </div>
                                <div className="bg-gray-700/30 p-4 rounded-lg">
                                    <div className="text-gray-400 text-sm">7d Change</div>
                                    <div className={`font-bold ${
                                        coin.percent_change_7d >= 0 ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                        {coin.percent_change_7d >= 0 ? '+' : ''}{coin.percent_change_7d.toFixed(2)}%
                                    </div>
                                </div>
                                <div className="bg-gray-700/30 p-4 rounded-lg">
                                    <div className="text-gray-400 text-sm">30d Change</div>
                                    <div className={`font-bold ${
                                        coin.percent_change_30d >= 0 ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                        {coin.percent_change_30d >= 0 ? '+' : ''}{coin.percent_change_30d.toFixed(2)}%
                                    </div>
                                </div>
                            </div>

                            <a 
                                href={`https://coinmarketcap.com/currencies/${coin.slug}/`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 inline-block text-purple-400 hover:text-purple-300 text-sm"
                            >
                                View on CoinMarketCap →
                            </a>
                        </div>
                    ))}
                </div>

                {/* Latest News Section */}
                <div className="mt-16 mb-16 bg-gray-800/50 backdrop-blur-md rounded-xl p-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-3">Latest Shitcoin News</h2>
                            <p className="text-gray-300">
                                Stay updated with the newest {keyword.replace(/-/g, ' ')} launches, trends, and market movements. 
                                Get real-time insights and trading opportunities.
                            </p>
                        </div>
                        <a 
                            href="/"
                            className="bg-purple-500 hover:bg-purple-600 px-8 py-4 rounded-lg transition-all transform hover:scale-105 flex items-center gap-2 whitespace-nowrap"
                        >
                            <span>View Latest Launches</span>
                            <span className="text-xl">→</span>
                        </a>
                    </div>
                </div>

                <div className="mt-16">
                    <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions about {keyword}</h2>
                    <div className="space-y-4">
                        {getFAQContent(keyword).map((faq, index) => (
                            <div key={index} className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6">
                                <h3 className="text-xl font-bold mb-2">{faq.question}</h3>
                                <p className="text-gray-300">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-12 mb-8 bg-purple-500/20 border border-purple-500/30 rounded-xl p-8 text-center">
                    <h3 className="text-2xl font-bold mb-4">Start Trading Shitcoins</h3>
                    <p className="text-gray-300 mb-6">
                        Get started with the most popular meme coins and latest launches. Always remember to trade responsibly.
                    </p>
                    <div className="flex justify-center gap-4">
                        <a 
                            href="https://www.binance.com/en/markets/memecoins"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-lg transition-colors"
                        >
                            Trade on Binance
                        </a>
                        <a 
                            href="https://app.uniswap.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg transition-colors"
                        >
                            Use Uniswap
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
} 