'use client';

import { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import { metadata } from './metadata';

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

export default function NewShitcoins() {
    const [coins, setCoins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCoins = async () => {
            try {
                const response = await fetch('/api/memecoins');
                const data = await response.json();
                
                if (data.error) throw new Error(data.error);
                
                // Get all coins and sort by market cap
                const allCoins = Object.values(data.data)
                    .flat()
                    .sort((a, b) => b.market_cap - a.market_cap)
                    .slice(0, 25); // Get top 25
                
                setCoins(allCoins);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCoins();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center justify-center">
                <div className="loading-container">
                    <span className="stars">✨</span>
                    <span className="stars">✨</span>
                    <span className="stars">✨</span>
                    <span className="animate-rocket">🚀</span>
                </div>
                <div className="mt-4 text-2xl font-bold">Loading Top Shitcoins...</div>
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
                    <h1 className="text-5xl font-bold mb-6">🔥 Shitcoins List 2024</h1>
                    <p className="text-xl text-gray-300 mb-8">Top 25 Best New Shitcoins to Buy and Trade</p>
                </div>

                <div className="mb-12 prose prose-invert max-w-none">
                    <div className="bg-gray-800/50 p-8 rounded-xl mb-8">
                        <h2 className="text-3xl font-bold mb-4">New Shitcoins List</h2>
                        <p>
                            Live prices and rankings for the top shitcoins in crypto. Find new shitcoin listings, best shitcoins to buy, and trending meme coins updated in real-time.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-gray-800/50 p-6 rounded-xl">
                            <h3 className="text-xl font-bold mb-2">Where to Buy Shitcoins 💰</h3>
                            <ul className="list-disc pl-4 space-y-2">
                                <li>Binance - Largest shitcoins listing</li>
                                <li>Uniswap - New shitcoin launches</li>
                                <li>PancakeSwap - BSC shitcoins</li>
                                <li>Gate.io - Early listings</li>
                            </ul>
                        </div>
                        <div className="bg-gray-800/50 p-6 rounded-xl">
                            <h3 className="text-xl font-bold mb-2">Shitcoin Trading Tips 📊</h3>
                            <ul className="list-disc pl-4 space-y-2">
                                <li>Check trading volume</li>
                                <li>Join Telegram groups</li>
                                <li>Monitor social trends</li>
                                <li>Research new listings</li>
                            </ul>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gray-800/50 p-6 rounded-xl">
                            <h3 className="text-xl font-bold mb-2">🚀 Best Time to Buy</h3>
                            <p>Track new shitcoin listings and early launches</p>
                        </div>
                        <div className="bg-gray-800/50 p-6 rounded-xl">
                            <h3 className="text-xl font-bold mb-2">👥 Community</h3>
                            <p>Join shitcoin trading Telegram groups</p>
                        </div>
                        <div className="bg-gray-800/50 p-6 rounded-xl">
                            <h3 className="text-xl font-bold mb-2">📈 Price Action</h3>
                            <p>Monitor shitcoins price movements</p>
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold mt-8 mb-4">Top Shitcoins Rankings</h3>
                    <p className="mb-6">
                        Live shitcoin prices and market data. Updated every 15 minutes with the best shitcoins to buy right now.
                    </p>
                </div>

                <div className="grid gap-6">
                    {coins.map((coin, index) => (
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

                <div className="mt-12 prose prose-invert max-w-none">
                    <div className="bg-red-500/20 border border-red-500/30 p-6 rounded-xl mb-8">
                        <h3 className="text-xl font-bold mb-2">⚠️ Shitcoin Trading Risks</h3>
                        <p>
                            Trading shitcoins carries extreme risk. These crypto assets are highly volatile and can lose value rapidly. Only trade with funds you can afford to lose.
                        </p>
                    </div>

                    <h3 className="text-2xl font-bold mb-4">Examples of Shitcoins</h3>
                    <p>
                        Popular shitcoins include meme tokens, food coins, and animal-themed cryptocurrencies. Many are listed on Binance and other major exchanges, with new shitcoins launching daily.
                    </p>
                </div>
            </div>
        </div>
    );
} 