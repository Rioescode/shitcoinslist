'use client';

import { useState } from 'react';

export default function ProfitCalculator({ coins, formatNumber, formatPrice }) {
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [investment, setInvestment] = useState(1000);
    const [entryPrice, setEntryPrice] = useState(0);
    const [exitPrice, setExitPrice] = useState(0);

    // Filter coins for search
    const filteredCoins = (coins || []).filter(coin => 
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCoinSelect = (coin) => {
        setSelectedCoin(coin);
        setEntryPrice(coin.price);
        setExitPrice(coin.price * 2); // Default to 2x target
        setShowSearch(false);
        setSearchTerm('');
    };

    // Calculate results
    const calculateResults = () => {
        const tokens = investment / entryPrice;
        const exitValue = tokens * exitPrice;
        const profit = exitValue - investment;
        const profitPercentage = ((exitValue / investment) - 1) * 100;
        
        // Advanced calculations
        const fees = investment * 0.001; // Assuming 0.1% trading fee
        const netProfit = profit - (fees * 2); // Entry and exit fees
        const roi = (netProfit / investment) * 100;

        return {
            tokens,
            exitValue,
            profit,
            profitPercentage,
            fees,
            netProfit,
            roi
        };
    };

    const results = calculateResults();

    // Quick target buttons
    const targetButtons = [
        { label: '2x', multiplier: 2 },
        { label: '5x', multiplier: 5 },
        { label: '10x', multiplier: 10 },
        { label: '-50%', multiplier: 0.5 },
        { label: '-20%', multiplier: 0.8 }
    ];

    return (
        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">💰 Moon Calculator</h2>

            {/* Coin Selection */}
            <div className="mb-6">
                {selectedCoin ? (
                    <div className="flex items-center justify-between bg-gray-700/30 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <img 
                                src={selectedCoin.logo}
                                alt={selectedCoin.name}
                                className="w-10 h-10 rounded-full"
                            />
                            <div>
                                <div className="font-bold">{selectedCoin.name}</div>
                                <div className="text-sm text-gray-400">{selectedCoin.symbol}</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowSearch(true)}
                            className="px-3 py-1 bg-gray-600/50 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                        >
                            Change Coin
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowSearch(true)}
                        className="w-full p-4 border-2 border-dashed border-gray-700 rounded-lg hover:border-purple-500/50 transition-colors"
                    >
                        Select a Coin to Calculate
                    </button>
                )}

                {/* Coin Search Dropdown */}
                {showSearch && (
                    <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">Select Coin</h3>
                                <button 
                                    onClick={() => setShowSearch(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>
                            <input
                                type="text"
                                placeholder="Search coins..."
                                className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 mb-4"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                            <div className="max-h-96 overflow-y-auto">
                                {filteredCoins.map(coin => (
                                    <div
                                        key={coin.id}
                                        className="flex items-center gap-3 p-3 hover:bg-gray-700/50 rounded-lg cursor-pointer"
                                        onClick={() => handleCoinSelect(coin)}
                                    >
                                        <img 
                                            src={coin.logo}
                                            alt={coin.name}
                                            className="w-8 h-8 rounded-full"
                                        />
                                        <div className="flex-1">
                                            <div className="font-semibold">{coin.name}</div>
                                            <div className="text-sm text-gray-400">{coin.symbol}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono">${formatPrice(coin.price)}</div>
                                            <div className={`text-sm ${coin.percent_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {coin.percent_change_24h >= 0 ? '↗' : '↘'} {coin.percent_change_24h.toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {selectedCoin && (
                <>
                    {/* Investment Input */}
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Investment Amount (USD)</label>
                            <input
                                type="number"
                                value={investment}
                                onChange={(e) => setInvestment(parseFloat(e.target.value) || 0)}
                                className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600"
                                min="0"
                                step="100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Entry Price (Current: ${formatPrice(selectedCoin.price)})</label>
                            <input
                                type="number"
                                value={entryPrice}
                                onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
                                className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600"
                                min="0"
                                step="0.000001"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Target Price</label>
                            <input
                                type="number"
                                value={exitPrice}
                                onChange={(e) => setExitPrice(parseFloat(e.target.value) || 0)}
                                className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600"
                                min="0"
                                step="0.000001"
                            />
                        </div>

                        {/* Quick Target Buttons */}
                        <div className="flex flex-wrap gap-2">
                            {targetButtons.map(target => (
                                <button
                                    key={target.label}
                                    onClick={() => setExitPrice(entryPrice * target.multiplier)}
                                    className="px-3 py-1 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 text-sm"
                                >
                                    {target.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="bg-gray-700/30 rounded-lg p-4">
                        <h3 className="text-lg font-bold mb-4">Estimated Returns</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Tokens:</span>
                                <span>{formatNumber(results.tokens)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Exit Value:</span>
                                <span>${formatNumber(results.exitValue)}</span>
                            </div>
                            <div className="flex justify-between font-bold">
                                <span className={results.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                                    Profit/Loss:
                                </span>
                                <span className={results.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                                    ${formatNumber(results.profit)}
                                    ({results.profitPercentage.toFixed(2)}%)
                                </span>
                            </div>

                            <div className="border-t border-gray-600 my-3"></div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Trading Fees:</span>
                                <span className="text-red-400">-${formatNumber(results.fees * 2)}</span>
                            </div>
                            <div className="flex justify-between font-bold">
                                <span className="text-purple-400">Net Profit:</span>
                                <span className="text-purple-400">
                                    ${formatNumber(results.netProfit)}
                                    ({results.roi.toFixed(2)}% ROI)
                                </span>
                            </div>
                        </div>

                        {/* Risk Warning */}
                        <div className="mt-4 text-xs text-gray-500">
                            ⚠️ This is a simulation only. Actual results may vary due to market conditions,
                            fees, slippage, and other factors.
                        </div>
                    </div>
                </>
            )}
        </div>
    );
} 