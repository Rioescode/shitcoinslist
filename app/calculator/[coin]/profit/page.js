'use client';

import { useState, useEffect } from 'react';
import ProfitCalculator from '@/components/ProfitCalculator';

export default async function ProfitCalculatorPage({ params }) {
    try {
        const { coin } = params;
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memecoins`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch coin data');
        }

        const { data: categorizedCoins } = await response.json();
        const allCoins = Object.values(categorizedCoins || {}).flat();
        
        const selectedCoin = allCoins.find(c => 
            c.symbol.toLowerCase() === coin.toLowerCase() ||
            c.slug.toLowerCase() === coin.toLowerCase()
        );

        if (!selectedCoin) {
            return (
                <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white p-4 md:p-8">
                    <div className="max-w-7xl mx-auto text-center">
                        <h1 className="text-4xl font-bold">Coin Not Found</h1>
                        <p className="mt-4">The requested coin could not be found.</p>
                        <a href="/" className="mt-8 inline-block px-6 py-2 bg-purple-500 rounded-lg hover:bg-purple-600">
                            Return Home
                        </a>
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white p-4 md:p-8">
                <div className="max-w-7xl mx-auto pt-16">
                    <header className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            {selectedCoin.name} Profit Calculator
                        </h1>
                        <p className="text-xl text-gray-300">
                            Calculate potential profits and analyze returns
                        </p>
                    </header>

                    <ProfitCalculator coin={selectedCoin} />
                </div>
            </div>
        );

    } catch (error) {
        console.error('Error:', error);
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white p-4 md:p-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl font-bold">Error Loading Calculator</h1>
                    <p className="mt-4">There was an error loading the calculator. Please try again later.</p>
                    <a href="/" className="mt-8 inline-block px-6 py-2 bg-purple-500 rounded-lg hover:bg-purple-600">
                        Return Home
                    </a>
                </div>
            </div>
        );
    }
} 