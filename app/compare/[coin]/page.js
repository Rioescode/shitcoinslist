'use client';

import { useEffect, useState } from 'react';
import ComparisonTool from '../../../components/ComparisonTool';

export default function ComparePage({ params }) {
    const { coin: coinSymbol } = params;

    const [coins, setCoins] = useState([]);
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/memecoins');
                const { data: categorizedCoins } = await response.json();
                const allCoins = Object.values(categorizedCoins).flat();
                setCoins(allCoins);
                
                const coin = allCoins.find(c => 
                    c.symbol.toLowerCase() === coinSymbol.toLowerCase()
                );
                setSelectedCoin(coin);
                
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [coinSymbol]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto pt-16">
                <ComparisonTool
                    coins={coins}
                    formatNumber={(num) => new Intl.NumberFormat('en-US').format(num)}
                    formatPrice={(price) => price.toFixed(6)}
                    formatPercentage={(percent) => percent.toFixed(2)}
                    preselectedCoin={selectedCoin}
                />
            </div>
        </div>
    );
} 