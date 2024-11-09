'use client';

import { useState } from 'react';

export default function MarketSummary({ coins, formatNumber }) {
    const [timeframe, setTimeframe] = useState('24h');

    // Calculate market metrics
    const calculateMetrics = () => {
        const allCoins = Object.values(coins).flat();
        
        const totals = allCoins.reduce((acc, coin) => {
            // Get the correct percentage change based on timeframe
            let percentChange;
            switch(timeframe) {
                case '7d':
                    percentChange = coin.percent_change_7d || 0;
                    break;
                case '30d':
                    percentChange = coin.percent_change_30d || 0;
                    break;
                default: // 24h
                    percentChange = coin.percent_change_24h || 0;
            }

            // Add validation to filter out extreme values
            if (Math.abs(percentChange) > 1000) {
                percentChange = 0; // Ignore unrealistic changes
            }

            return {
                marketCap: acc.marketCap + (coin.market_cap || 0),
                volume24h: acc.volume24h + (coin.volume_24h || 0),
                coins: acc.coins + 1,
                gainers: acc.gainers + (percentChange > 0 ? 1 : 0),
                losers: acc.losers + (percentChange < 0 ? 1 : 0),
                totalVolume: acc.totalVolume + (coin.volume_24h || 0),
                averageChange: acc.averageChange + (percentChange || 0),
                highestGain: Math.min(Math.max(acc.highestGain, percentChange || 0), 1000),
                biggestLoss: Math.max(Math.min(acc.biggestLoss, percentChange || 0), -1000),
            };
        }, {
            marketCap: 0,
            volume24h: 0,
            coins: 0,
            gainers: 0,
            losers: 0,
            totalVolume: 0,
            averageChange: 0,
            highestGain: -Infinity,
            biggestLoss: Infinity
        });

        // Calculate averages and percentages with validation
        totals.averageChange = totals.coins > 0 ? (totals.averageChange / totals.coins) : 0;
        if (Math.abs(totals.averageChange) > 1000) {
            totals.averageChange = 0; // Reset if unrealistic
        }
        
        totals.gainerPercentage = totals.coins > 0 ? (totals.gainers / totals.coins) * 100 : 0;
        totals.volumeToMarketCap = totals.marketCap > 0 ? (totals.volume24h / totals.marketCap) * 100 : 0;

        return totals;
    };

    const metrics = calculateMetrics();

    return (
        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">📊 Meme Market Overview</h2>
                <div className="flex items-center gap-2 bg-gray-700/30 rounded-lg p-1">
                    {[
                        { value: '24h', label: '24H' },
                        { value: '7d', label: '7D' },
                        { value: '30d', label: '30D' }
                    ].map((period) => (
                        <button
                            key={period.value}
                            onClick={() => setTimeframe(period.value)}
                            className={`px-3 py-1 rounded-lg transition-all ${
                                timeframe === period.value 
                                    ? 'bg-purple-500 text-white' 
                                    : 'hover:bg-gray-600/50'
                            }`}
                        >
                            {period.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Market Size */}
                <div className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/40 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                        <div className="text-sm text-gray-400">Total Market Cap</div>
                        <div className="text-xs bg-purple-500/20 px-2 py-1 rounded-full">
                            {metrics.coins} coins
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
                        ${formatNumber(metrics.marketCap)}
                    </div>
                    <div className="mt-2 text-sm text-gray-400">
                        Avg. Market Cap: ${formatNumber(metrics.marketCap / metrics.coins)}
                    </div>
                </div>

                {/* Volume Analysis */}
                <div className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/40 transition-all">
                    <div className="text-sm text-gray-400 mb-2">24h Volume</div>
                    <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                        ${formatNumber(metrics.volume24h)}
                    </div>
                    <div className="mt-2 text-sm text-gray-400">
                        Volume/Market Cap: {metrics.volumeToMarketCap.toFixed(2)}%
                    </div>
                </div>

                {/* Market Sentiment */}
                <div className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/40 transition-all">
                    <div className="text-sm text-gray-400 mb-2">Market Sentiment</div>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-2xl font-bold ${
                            metrics.averageChange >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                            {metrics.averageChange.toFixed(2)}%
                        </span>
                        <span className="text-sm text-gray-400">avg. change</span>
                    </div>
                    <div className="mt-2 flex justify-between text-sm">
                        <span className="text-green-400">
                            Gainers: {metrics.gainers} ({metrics.gainerPercentage.toFixed(1)}%)
                        </span>
                        <span className="text-red-400">
                            Losers: {metrics.losers}
                        </span>
                    </div>
                </div>

                {/* Extremes */}
                <div className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/40 transition-all">
                    <div className="text-sm text-gray-400 mb-2">Market Extremes</div>
                    <div className="space-y-2">
                        <div>
                            <div className="text-sm text-green-400">Highest Gain</div>
                            <div className="text-lg font-bold">
                                +{metrics.highestGain.toFixed(2)}%
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-red-400">Biggest Loss</div>
                            <div className="text-lg font-bold">
                                {metrics.biggestLoss.toFixed(2)}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Market Distribution */}
                <div className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/40 transition-all">
                    <div className="text-sm text-gray-400 mb-2">Market Distribution</div>
                    <div className="space-y-2">
                        {Object.entries(coins).map(([category, categoryCoins]) => (
                            <div key={category} className="flex justify-between items-center">
                                <span className="text-sm capitalize">{category}</span>
                                <span className="text-sm font-bold">{categoryCoins.length}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Volume Distribution */}
                <div className="bg-gray-700/30 rounded-lg p-4 hover:bg-gray-700/40 transition-all">
                    <div className="text-sm text-gray-400 mb-2">Volume Activity</div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span>High Volume (&gt;1x MC)</span>
                            <span className="font-bold">
                                {Object.values(coins).flat().filter(c => c.volume_24h > c.market_cap).length}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Medium Volume</span>
                            <span className="font-bold">
                                {Object.values(coins).flat().filter(c => 
                                    c.volume_24h > c.market_cap * 0.5 && 
                                    c.volume_24h <= c.market_cap
                                ).length}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Low Volume</span>
                            <span className="font-bold">
                                {Object.values(coins).flat().filter(c => c.volume_24h <= c.market_cap * 0.5).length}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 