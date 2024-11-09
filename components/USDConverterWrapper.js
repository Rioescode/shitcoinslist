'use client';

import { useState } from 'react';

export default function USDConverterWrapper({ coins }) {
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [amount, setAmount] = useState('');
    const [conversionType, setConversionType] = useState('toUSD');

    // Filter coins based on search
    const filteredCoins = coins.filter(coin => 
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5); // Show top 5 results

    const handleConversion = () => {
        if (!selectedCoin || !amount) return null;
        
        if (conversionType === 'toUSD') {
            return amount * selectedCoin.price;
        } else {
            return amount / selectedCoin.price;
        }
    };

    const result = handleConversion();

    return (
        <div className="space-y-4">
            {/* Coin Search */}
            <div>
                <label className="block text-sm text-gray-400 mb-1">Search Coin</label>
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name or symbol..."
                        className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600"
                    />
                    {searchTerm && (
                        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                            {filteredCoins.map(coin => (
                                <div
                                    key={coin.id}
                                    className="p-3 hover:bg-gray-700 cursor-pointer flex items-center gap-3"
                                    onClick={() => {
                                        setSelectedCoin(coin);
                                        setSearchTerm('');
                                    }}
                                >
                                    <img 
                                        src={coin.logo}
                                        alt={coin.name}
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <div>
                                        <div className="font-bold">{coin.name}</div>
                                        <div className="text-sm text-gray-400">{coin.symbol}</div>
                                    </div>
                                    <div className="ml-auto text-right">
                                        <div className="text-sm">${coin.price.toFixed(6)}</div>
                                        <div className={`text-xs ${coin.percent_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {coin.percent_change_24h.toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Selected Coin Display */}
            {selectedCoin && (
                <div className="bg-gray-700/30 p-3 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img 
                            src={selectedCoin.logo}
                            alt={selectedCoin.name}
                            className="w-8 h-8 rounded-full"
                        />
                        <div>
                            <div className="font-bold">{selectedCoin.name}</div>
                            <div className="text-sm text-gray-400">${selectedCoin.price.toFixed(6)}</div>
                        </div>
                    </div>
                    <button
                        onClick={() => setSelectedCoin(null)}
                        className="text-gray-400 hover:text-gray-200"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Conversion Type Toggle */}
            <div className="flex gap-2">
                <button
                    className={`flex-1 p-2 rounded-lg ${
                        conversionType === 'toUSD' 
                            ? 'bg-purple-500' 
                            : 'bg-gray-700/50'
                    }`}
                    onClick={() => setConversionType('toUSD')}
                >
                    Coin → USD
                </button>
                <button
                    className={`flex-1 p-2 rounded-lg ${
                        conversionType === 'fromUSD' 
                            ? 'bg-purple-500' 
                            : 'bg-gray-700/50'
                    }`}
                    onClick={() => setConversionType('fromUSD')}
                >
                    USD → Coin
                </button>
            </div>

            {/* Amount Input */}
            <div>
                <label className="block text-sm text-gray-400 mb-1">
                    {conversionType === 'toUSD' ? 'Coin Amount' : 'USD Amount'}
                </label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-700/50 border border-gray-600"
                    placeholder="Enter amount"
                    min="0"
                    step="any"
                />
            </div>

            {/* Result Display */}
            {selectedCoin && amount && result !== null && (
                <div className="bg-gray-700/30 p-4 rounded-lg">
                    <div className="text-sm text-gray-400">Result:</div>
                    <div className="text-xl font-bold">
                        {conversionType === 'toUSD' ? (
                            <>
                                ${result.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })} USD
                            </>
                        ) : (
                            <>
                                {result.toLocaleString(undefined, {
                                    minimumFractionDigits: 6,
                                    maximumFractionDigits: 8
                                })} {selectedCoin.symbol}
                            </>
                        )}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                        Rate: 1 {selectedCoin.symbol} = ${selectedCoin.price.toFixed(6)}
                    </div>
                </div>
            )}
        </div>
    );
} 