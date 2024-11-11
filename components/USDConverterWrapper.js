'use client';

import { useState, useEffect } from 'react';

export default function USDConverterWrapper({ coins, defaultCoin }) {
    const [amount, setAmount] = useState('1');
    const [selectedCoin, setSelectedCoin] = useState(defaultCoin);
    const [usdValue, setUsdValue] = useState('0');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Group and filter coins based on search
    const filterCoins = () => {
        if (!searchTerm) return [];
        
        return coins.filter(coin => 
            coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 10); // Limit to 10 results for performance
    };

    // Calculate USD value
    useEffect(() => {
        if (selectedCoin && amount) {
            const value = parseFloat(amount) * selectedCoin.price;
            setUsdValue(value.toFixed(6));
        }
    }, [amount, selectedCoin]);

    const handleCoinSelect = (coin) => {
        setSelectedCoin(coin);
        setSearchTerm('');
        setIsSearchOpen(false);
        window.location.href = `/tools/usd-converter/${coin.slug}`;
    };

    return (
        <div className="space-y-6">
            {/* Coin Selection */}
            <div className="space-y-4">
                {/* Selected Coin Display */}
                {selectedCoin && (
                    <div className="flex items-center gap-3 p-4 bg-gray-700/30 rounded-lg">
                        <img 
                            src={selectedCoin.logo}
                            alt={selectedCoin.name}
                            className="w-8 h-8 rounded-full"
                        />
                        <div>
                            <div className="font-bold">{selectedCoin.name}</div>
                            <div className="text-sm text-gray-400">{selectedCoin.symbol}</div>
                        </div>
                        <span className={`ml-auto px-2 py-1 rounded-full text-xs ${
                            selectedCoin.isTopCoin 
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-purple-500/20 text-purple-300'
                        }`}>
                            {selectedCoin.isTopCoin ? 'Top 100' : 'Meme Coin'}
                        </span>
                    </div>
                )}

                {/* Search Input */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsSearchOpen(true);
                        }}
                        onFocus={() => setIsSearchOpen(true)}
                        className="w-full bg-gray-700/50 rounded-lg p-4 pl-10 text-white"
                        placeholder="Search coins..."
                    />
                    <svg 
                        className="absolute left-3 top-4 h-5 w-5 text-gray-400" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>

                    {/* Search Results Dropdown */}
                    {isSearchOpen && searchTerm && (
                        <div className="absolute w-full mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 max-h-96 overflow-y-auto z-50">
                            {filterCoins().map(coin => (
                                <button
                                    key={coin.id}
                                    onClick={() => handleCoinSelect(coin)}
                                    className="w-full px-4 py-3 hover:bg-gray-700/50 flex items-center gap-3 transition-colors"
                                >
                                    <img 
                                        src={coin.logo}
                                        alt={coin.name}
                                        className="w-6 h-6 rounded-full"
                                    />
                                    <div className="text-left">
                                        <div className="font-medium">{coin.name}</div>
                                        <div className="text-sm text-gray-400">{coin.symbol}</div>
                                    </div>
                                    <span className={`ml-auto px-2 py-1 rounded-full text-xs ${
                                        coin.isTopCoin 
                                            ? 'bg-blue-500/20 text-blue-300'
                                            : 'bg-purple-500/20 text-purple-300'
                                    }`}>
                                        {coin.isTopCoin ? `Rank #${coin.cmc_rank}` : 'Meme Coin'}
                                    </span>
                                </button>
                            ))}
                            {filterCoins().length === 0 && (
                                <div className="px-4 py-3 text-gray-400 text-center">
                                    No coins found
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Conversion Inputs */}
            <div className="space-y-4">
                <div className="bg-gray-700/30 p-4 rounded-lg">
                    <label className="block text-sm text-gray-400 mb-2">
                        Amount in {selectedCoin?.symbol || 'Coin'}
                    </label>
                    <input 
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-gray-600/50 rounded-lg p-3"
                        placeholder="Enter amount..."
                        min="0"
                        step="any"
                    />
                </div>

                <div className="bg-gray-700/30 p-4 rounded-lg">
                    <label className="block text-sm text-gray-400 mb-2">Value in USD</label>
                    <input 
                        type="text"
                        value={`$${usdValue}`}
                        className="w-full bg-gray-600/50 rounded-lg p-3"
                        readOnly
                    />
                </div>
            </div>

            {/* Current Price */}
            {selectedCoin && (
                <div className="text-sm text-gray-400 text-center">
                    Current Price: ${selectedCoin.price.toFixed(6)} USD
                </div>
            )}
        </div>
    );
} 