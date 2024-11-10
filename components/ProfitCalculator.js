'use client';

import { useState } from 'react';

export default function ProfitCalculator({ coins, formatNumber, formatPrice }) {
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [investment, setInvestment] = useState(1000);
    const [targetPrice, setTargetPrice] = useState(0);

    // Filter coins for search
    const filteredCoins = (coins || []).filter(coin => 
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectCoin = (coin) => {
        setSelectedCoin(coin);
        setTargetPrice(coin.price * 2); // Default to 2x target
        setShowSearch(false);
        setSearchTerm('');
    };

    // Calculate profit and ROI
    const calculateProfit = () => {
        if (!selectedCoin || !investment || !targetPrice) return 0;
        const tokens = investment / selectedCoin.price;
        const exitValue = tokens * targetPrice;
        return exitValue - investment;
    };

    const calculateROI = () => {
        if (!investment || !calculateProfit()) return 0;
        return ((calculateProfit() / investment) * 100).toFixed(2);
    };

    // Quick target multipliers
    const targetMultipliers = [
        { label: '2x', value: 2 },
        { label: '5x', value: 5 },
        { label: '10x', value: 10 },
        { label: '100x', value: 100 }
    ];

    return (
        <div className="space-y-6">
            {/* Input Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                    {/* Coin Selection */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Selected Coin</label>
                        <div 
                            onClick={() => setShowSearch(true)}
                            className="p-3 rounded-lg bg-gray-700/50 border border-gray-600 cursor-pointer"
                        >
                            {selectedCoin ? (
                                <div className="flex items-center gap-2">
                                    <img 
                                        src={selectedCoin.logo} 
                                        alt={selectedCoin.name} 
                                        className="w-6 h-6 rounded-full"
                                    />
                                    <span>{selectedCoin.name}</span>
                                    <span className="text-gray-400">({selectedCoin.symbol})</span>
                                </div>
                            ) : (
                                <span className="text-gray-400">Select a coin</span>
                            )}
                        </div>
                    </div>

                    {/* Investment Amount */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Investment Amount ($)</label>
                        <input
                            type="number"
                            value={investment}
                            onChange={(e) => setInvestment(Number(e.target.value))}
                            className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600"
                            placeholder="Enter investment amount"
                            min="0"
                        />
                    </div>

                    {/* Target Price */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Target Price ($)</label>
                        <input
                            type="number"
                            value={targetPrice}
                            onChange={(e) => setTargetPrice(Number(e.target.value))}
                            className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600"
                            placeholder="Enter target price"
                            min="0"
                            step="0.000001"
                        />
                    </div>

                    {/* Quick Target Buttons */}
                    {selectedCoin && (
                        <div className="flex flex-wrap gap-2">
                            {targetMultipliers.map(({ label, value }) => (
                                <button
                                    key={label}
                                    onClick={() => setTargetPrice(selectedCoin.price * value)}
                                    className="px-3 py-1 bg-purple-500/20 rounded-lg hover:bg-purple-500/30 text-sm"
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Results Section */}
                <div className="bg-gray-700/30 p-4 rounded-lg">
                    <h3 className="text-lg font-bold mb-4">Potential Returns</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Investment:</span>
                            <span>${formatNumber(investment)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Target Value:</span>
                            <span>${formatNumber(investment + calculateProfit())}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Profit:</span>
                            <span className="text-green-400">${formatNumber(calculateProfit())}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">ROI:</span>
                            <span className="text-purple-400">{calculateROI()}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Coin Search Modal */}
            {showSearch && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Select a Coin</h3>
                            <button 
                                onClick={() => setShowSearch(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                ×
                            </button>
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search coins..."
                            className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600 mb-4"
                        />
                        <div className="max-h-96 overflow-y-auto">
                            {filteredCoins.map(coin => (
                                <div
                                    key={coin.symbol}
                                    onClick={() => selectCoin(coin)}
                                    className="flex items-center gap-3 p-3 hover:bg-gray-700/50 rounded-lg cursor-pointer"
                                >
                                    <img 
                                        src={coin.logo} 
                                        alt={coin.name} 
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <div>
                                        <div>{coin.name}</div>
                                        <div className="text-sm text-gray-400">{coin.symbol}</div>
                                    </div>
                                    <div className="ml-auto text-right">
                                        <div>${formatPrice(coin.price)}</div>
                                        <div className={`text-sm ${
                                            coin.percent_change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                            {coin.percent_change_24h >= 0 ? '+' : ''}{coin.percent_change_24h.toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 