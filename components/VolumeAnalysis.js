'use client';

import { useState, useEffect } from 'react';

export default function VolumeAnalysis({ coins, formatNumber, formatPrice }) {
    const [timeframe, setTimeframe] = useState('24h');
    const [volumeThreshold, setVolumeThreshold] = useState(2); // Volume multiplier threshold

    // Calculate volume metrics
    const calculateVolumeMetrics = () => {
        return coins
            .map(coin => {
                const volumeToMarketCap = coin.volume_24h / coin.market_cap;
                const averageVolume = coin.volume_24h / 24;
                const isUnusual = volumeToMarketCap > volumeThreshold;

                return {
                    ...coin,
                    volumeToMarketCap,
                    averageVolume,
                    isUnusual,
                    volumeScore: Math.min(10, (volumeToMarketCap * 5))
                };
            })
            .filter(coin => {
                const ratio = coin.volume_24h / coin.market_cap;
                return ratio >= volumeThreshold;
            })
            .sort((a, b) => b.volumeToMarketCap - a.volumeToMarketCap)
            .slice(0, 10);
    };

    // Get sorted and filtered coins
    const sortedCoins = calculateVolumeMetrics();

    // Add console.log to debug
    console.log('Volume Threshold:', volumeThreshold);
    console.log('Filtered Coins:', sortedCoins.length);
    console.log('Volume Ratios:', sortedCoins.map(c => ({
        symbol: c.symbol,
        ratio: (c.volume_24h / c.market_cap).toFixed(2)
    })));

    return (
        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">🔥 Volume Spike Hunter</h2>
                <div className="flex items-center gap-4">
                    <label className="text-sm text-gray-400">Volume/Market Cap Threshold:</label>
                    <select
                        className="bg-gray-700/50 rounded-lg px-4 py-2 border border-gray-600 hover:bg-gray-600/50 transition-colors"
                        value={volumeThreshold}
                        onChange={(e) => setVolumeThreshold(Number(e.target.value))}
                    >
                        <option value="0.5">0.5x Market Cap</option>
                        <option value="1">1x Market Cap</option>
                        <option value="2">2x Market Cap</option>
                        <option value="5">5x Market Cap</option>
                        <option value="10">10x Market Cap</option>
                    </select>
                </div>
            </div>

            {/* Add volume filter info */}
            <div className="mb-4 text-sm text-gray-400">
                Showing coins with 24h volume {volumeThreshold}x their market cap or higher
            </div>

            {/* Unusual Volume Alert */}
            {sortedCoins.filter(coin => coin.isUnusual).length > 0 && (
                <div className="mb-6 bg-red-500/20 p-4 rounded-lg border border-red-500/30">
                    <h3 className="text-lg font-bold text-red-400 mb-2">⚠️ Unusual Volume Detected</h3>
                    <p className="text-sm text-gray-300">
                        {sortedCoins.filter(coin => coin.isUnusual).length} coins showing unusual trading volume
                    </p>
                </div>
            )}

            {/* Volume Rankings */}
            <div className="space-y-4">
                {sortedCoins.map(coin => (
                    <div 
                        key={coin.symbol}
                        className={`bg-gray-700/30 rounded-lg p-4 transition-all ${
                            coin.isUnusual ? 'border border-red-500/30' : ''
                        }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <img 
                                    src={coin.logo}
                                    alt={coin.name}
                                    className="w-8 h-8 rounded-full"
                                />
                                <div>
                                    <h3 className="font-bold">{coin.name}</h3>
                                    <p className="text-sm text-gray-400">{coin.symbol}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-mono">${formatPrice(coin.price)}</div>
                                <div className={coin.percent_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                                    {coin.percent_change_24h >= 0 ? '↗' : '↘'} {coin.percent_change_24h.toFixed(2)}%
                                </div>
                            </div>
                        </div>

                        {/* Volume Metrics */}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <p className="text-sm text-gray-400">24h Volume</p>
                                <p className="font-bold">${formatNumber(coin.volume_24h)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Volume/Market Cap</p>
                                <p className="font-bold">{(coin.volumeToMarketCap * 100).toFixed(2)}%</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Avg Hourly Volume</p>
                                <p className="font-bold">${formatNumber(coin.averageVolume)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Volume Score</p>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-gray-600 rounded-full">
                                        <div 
                                            className={`h-full rounded-full ${
                                                coin.volumeScore > 7 ? 'bg-red-500' :
                                                coin.volumeScore > 4 ? 'bg-yellow-500' :
                                                'bg-green-500'
                                            }`}
                                            style={{ width: `${coin.volumeScore * 10}%` }}
                                        />
                                    </div>
                                    <span className="text-sm">{coin.volumeScore.toFixed(1)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Volume Alert Badge */}
                        {coin.isUnusual && (
                            <div className="mt-3 text-sm text-red-400 bg-red-500/10 px-3 py-1 rounded-full inline-block">
                                ⚠️ Unusual Volume Activity
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Volume Analysis Summary */}
            <div className="mt-6 bg-gray-700/30 rounded-lg p-4">
                <h3 className="font-bold mb-2">Volume Analysis Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-400">High Volume Coins</p>
                        <p className="font-bold">{sortedCoins.filter(c => c.volumeScore > 7).length}</p>
                    </div>
                    <div>
                        <p className="text-gray-400">Unusual Activity</p>
                        <p className="font-bold">{sortedCoins.filter(c => c.isUnusual).length}</p>
                    </div>
                </div>
            </div>
        </div>
    );
} 