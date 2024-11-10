'use client';

import { useState, useEffect } from 'react';

export default function ComparisonTool({ coins, formatNumber, formatPrice, formatPercentage, preselectedCoin }) {
    const [selectedCoins, setSelectedCoins] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        if (preselectedCoin && !selectedCoins.find(c => c.id === preselectedCoin.id)) {
            setSelectedCoins(prev => {
                if (prev.length < 3) {
                    return [...prev, preselectedCoin];
                }
                return prev;
            });
        }
    }, [preselectedCoin]);

    const addCoin = (coin) => {
        if (selectedCoins.length < 3 && !selectedCoins.find(c => c.id === coin.id)) {
            setSelectedCoins([...selectedCoins, coin]);
        }
    };

    const removeCoin = (coinId) => {
        setSelectedCoins(selectedCoins.filter(coin => coin.id !== coinId));
    };

    const filteredCoins = coins.filter(coin => 
        !selectedCoins.find(c => c.id === coin.id) &&
        (coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const basicMetrics = [
        { label: 'Price', key: 'price', format: formatPrice },
        { label: '24h Change', key: 'percent_change_24h', format: (value) => `${formatPercentage(value)}%` },
        { label: 'Market Cap', key: 'market_cap', format: (value) => `$${formatNumber(value)}` },
        { label: '24h Volume', key: 'volume_24h', format: (value) => `$${formatNumber(value)}` },
        { label: 'Rank', key: 'rank', format: (value) => `#${value}` }
    ];

    const advancedMetrics = [
        { 
            label: 'Volume/Market Cap Ratio', 
            key: 'volume_ratio',
            format: (value) => `${(value * 100).toFixed(2)}%`,
            calculate: (coin) => coin.volume_24h / coin.market_cap
        },
        {
            label: 'Market Dominance',
            key: 'market_dominance',
            format: (value) => `${value.toFixed(4)}%`,
            calculate: (coin) => (coin.market_cap / coins.reduce((acc, c) => acc + c.market_cap, 0)) * 100
        },
        {
            label: 'Volatility Score',
            key: 'volatility',
            format: (value) => value.toFixed(2),
            calculate: (coin) => Math.abs(coin.percent_change_24h) / 10
        },
        {
            label: 'Price Change Momentum',
            key: 'momentum',
            format: (value) => value.toFixed(2),
            calculate: (coin) => {
                const momentum = (coin.percent_change_24h || 0) / 24; // Average hourly change
                return momentum;
            },
            description: 'Average hourly price change'
        },
        {
            label: 'Trading Activity Score',
            key: 'trading_activity',
            format: (value) => value.toFixed(2) + '/10',
            calculate: (coin) => {
                const volumeRatio = coin.volume_24h / coin.market_cap;
                return Math.min(10, (volumeRatio * 100)); // Scale from 0-10
            },
            description: 'Trading volume relative to market cap (0-10)'
        },
        {
            label: 'Market Size Category',
            key: 'size_category',
            format: (value) => value,
            calculate: (coin) => {
                if (coin.market_cap >= 1000000000) return 'Large Cap (>$1B)';
                if (coin.market_cap >= 100000000) return 'Mid Cap (>$100M)';
                return 'Small Cap (<$100M)';
            },
            description: 'Market capitalization category'
        },
        {
            label: 'Volume/Price Ratio',
            key: 'volume_price_ratio',
            format: (value) => formatNumber(value),
            calculate: (coin) => coin.volume_24h / coin.price,
            description: 'Trading volume relative to price'
        },
        {
            label: 'Risk Score',
            key: 'risk_score',
            format: (value) => `${value}/10`,
            calculate: (coin) => {
                const volatility = Math.abs(coin.percent_change_24h) / 10;
                const volumeRatio = coin.volume_24h / coin.market_cap;
                const marketCapScore = coin.market_cap > 1000000000 ? 1 : 
                                     coin.market_cap > 100000000 ? 2 : 3;
                
                const riskScore = Math.min(10, ((volatility + volumeRatio * 10 + marketCapScore) / 3));
                return riskScore.toFixed(1);
            },
            description: 'Combined risk assessment (higher = riskier)'
        }
    ];

    const metrics = showAdvanced ? [...basicMetrics, ...advancedMetrics] : basicMetrics;

    const getBestValue = (metric) => {
        if (!selectedCoins.length) return null;
        const values = selectedCoins.map(coin => 
            metric.calculate ? metric.calculate(coin) : coin[metric.key]
        );
        return Math.max(...values);
    };

    const MetricInfo = ({ metric }) => {
        const [showInfo, setShowInfo] = useState(false);
        
        return (
            <div className="relative inline-block">
                {metric.description && (
                    <button
                        className="ml-2 text-gray-500 hover:text-gray-300"
                        onMouseEnter={() => setShowInfo(true)}
                        onMouseLeave={() => setShowInfo(false)}
                    >
                        ℹ️
                    </button>
                )}
                {showInfo && metric.description && (
                    <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-black/90 rounded text-xs text-gray-300 z-10">
                        {metric.description}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`bg-gray-800/50 backdrop-blur-md rounded-xl p-6 transition-all duration-300 mb-20 ${
            selectedCoins.length > 0 ? 'w-full' : 'w-full'
        }`}>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">🔍 Meme Battle</h2>
                {selectedCoins.length > 0 && (
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className={`px-4 py-2 rounded-lg transition-all ${
                            showAdvanced 
                                ? 'bg-purple-500/20 text-purple-300' 
                                : 'bg-gray-700/50 text-gray-300'
                        }`}
                    >
                        {showAdvanced ? '📊 Advanced Mode' : '📈 Basic Mode'}
                    </button>
                )}
            </div>

            <div className="mb-6">
                <div className="flex items-center gap-4 mb-4 max-w-3xl mx-auto">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search coins to compare..."
                            className="w-full p-3 pl-10 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-purple-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <span className="text-gray-400 bg-gray-700/30 px-4 py-2 rounded-full">
                        {selectedCoins.length}/3 selected
                    </span>
                </div>

                {searchTerm && (
                    <div className="max-h-48 overflow-y-auto bg-gray-700/50 rounded-lg mb-4 divide-y divide-gray-600/30 max-w-3xl mx-auto">
                        {filteredCoins.slice(0, 5).map(coin => (
                            <div
                                key={coin.id}
                                className="p-3 hover:bg-gray-600/50 cursor-pointer flex items-center gap-3 group"
                                onClick={() => addCoin(coin)}
                            >
                                <img 
                                    src={coin.logo} 
                                    alt={coin.name}
                                    className="w-8 h-8 rounded-full group-hover:scale-110 transition-transform"
                                />
                                <div className="flex-1">
                                    <div className="font-semibold group-hover:text-purple-400 transition-colors">
                                        {coin.name}
                                    </div>
                                    <div className="text-sm text-gray-400">{coin.symbol}</div>
                                </div>
                                <div className="text-sm text-gray-400">
                                    Rank #{coin.rank}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedCoins.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-gray-700/50 transform transition-all duration-300">
                    <table className="w-full text-lg">
                        <thead>
                            <tr>
                                <th className="text-left p-3 bg-gray-700/30">
                                    <div className="flex items-center justify-between">
                                        <span>Metric</span>
                                        {showAdvanced && (
                                            <span className="text-xs text-purple-400">
                                                Advanced Analytics
                                            </span>
                                        )}
                                    </div>
                                </th>
                                {selectedCoins.map(coin => (
                                    <th key={coin.id} className="p-3 bg-gray-700/30 text-center relative">
                                        <button
                                            onClick={() => removeCoin(coin.id)}
                                            className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-gray-600/50 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all"
                                        >
                                            ×
                                        </button>
                                        <div className="flex flex-col items-center gap-2 pt-4">
                                            <img 
                                                src={coin.logo} 
                                                alt={coin.name}
                                                className="w-8 h-8 rounded-full"
                                            />
                                            <span className="font-bold">{coin.symbol}</span>
                                            <span className="text-xs text-gray-400">#{coin.rank}</span>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {metrics.map(metric => {
                                const bestValue = getBestValue(metric);
                                return (
                                    <tr key={metric.key} className="border-t border-gray-700/30">
                                        <td className="p-3 text-gray-400">
                                            <div className="flex items-center">
                                                {metric.label}
                                                <MetricInfo metric={metric} />
                                                {metric.calculate && (
                                                    <span className="ml-1 text-xs text-purple-400/50">
                                                        (Advanced)
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        {selectedCoins.map(coin => {
                                            const value = metric.calculate ? 
                                                metric.calculate(coin) : 
                                                coin[metric.key];
                                            const isHighlight = value === bestValue;
                                            
                                            return (
                                                <td 
                                                    key={coin.id} 
                                                    className={`p-3 text-center ${
                                                        metric.key === 'percent_change_24h' 
                                                            ? value >= 0 
                                                                ? 'text-green-400' 
                                                                : 'text-red-400'
                                                            : isHighlight
                                                                ? 'text-purple-400 font-bold'
                                                                : ''
                                                    }`}
                                                >
                                                    {metric.format(value)}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center text-gray-400 py-16 bg-gray-700/20 rounded-lg">
                    <div className="text-6xl mb-4">🔍</div>
                    <div className="font-semibold text-xl">Select up to 3 coins to compare</div>
                    <div className="text-base text-gray-500 mt-2">
                        Use the search box above to find coins
                    </div>
                </div>
            )}
        </div>
    );
} 