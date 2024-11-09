'use client';

import { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Confetti from 'react-confetti';
import toast from 'react-hot-toast';
import CommunityVoting from '../components/CommunityVoting';
import ComparisonTool from '../components/ComparisonTool';
import ProfitCalculator from '../components/ProfitCalculator';
import MarketSummary from '../components/MarketSummary';
import VolumeAnalysis from '../components/VolumeAnalysis';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

// Add this function at the top level
const MEME_OF_DAY_KEY = 'memeOfTheDay';
const MEME_OF_DAY_TIMESTAMP = 'memeOfDayTimestamp';

export default function Home() {
    const [coins, setCoins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('market_cap');
    const [sortOrder, setSortOrder] = useState('desc');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [nextUpdate, setNextUpdate] = useState(null);
    const [activeCategory, setActiveCategory] = useState('top');
    const [categorizedCoins, setCategorizedCoins] = useState({
        top: [],
        mid: [],
        new: [],
        trending: [],
        other: []
    });
    const [visibleHotDeals, setVisibleHotDeals] = useState([]);
    const [visibleTopGainers, setVisibleTopGainers] = useState([]);
    const [dismissedDeals, setDismissedDeals] = useState(new Set());
    const [dismissedGainers, setDismissedGainers] = useState(new Set());
    const [watchlist, setWatchlist] = useState(() => {
        // Initialize from localStorage if available
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('memeWatchlist');
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });
    const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
    const [priceAlerts, setPriceAlerts] = useState(() => {
        if (typeof window !== 'undefined') {
            return JSON.parse(localStorage.getItem('priceAlerts') || '{}');
        }
        return {};
    });
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [selectedAlertCoin, setSelectedAlertCoin] = useState(null);
    const [showNotifications, setShowNotifications] = useState(true);
    const [autoHide, setAutoHide] = useState(false);
    const [memeOfTheDay, setMemeOfTheDay] = useState(null);

    const categoryInfo = {
        top: { name: '🏆 Top Memes', description: 'Market cap over $1B' },
        mid: { name: '💫 Mid Cap', description: 'Market cap over $100M' },
        new: { name: '🆕 New Listings', description: 'Listed in the last 30 days' },
        trending: { name: '🔥 Trending', description: 'High trading volume' },
        other: { name: '📊 Other Memes', description: 'All other meme coins' }
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 0
        }).format(num);
    };

    const formatPrice = (price) => {
        if (price === null || price === undefined) return '$0.00';
        return price < 0.01 ? price.toFixed(8) : price.toFixed(4);
    };

    const formatPercentage = (percent) => {
        if (percent === null || percent === undefined) return '0.00';
        return percent.toFixed(2);
    };

    const fetchMemeCoins = async () => {
        try {
            setLoading(true);
            setError(null);

            // Use relative URL
            const response = await fetch('/api/memecoins', {
                cache: 'no-store'
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }

            const result = await response.json();
            
            if (result.error) {
                throw new Error(result.error);
            }
            
            setCategorizedCoins(result.data || {});
            setNextUpdate(result.nextUpdate);
            
        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMemeCoins();
        
        // Set up interval for next update
        const interval = setInterval(() => {
            if (nextUpdate && new Date() >= new Date(nextUpdate)) {
                fetchMemeCoins();
            }
        }, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, [nextUpdate]);

    useEffect(() => {
        const loadMemeOfDay = () => {
            // Check if we have a stored meme and timestamp
            const storedMeme = localStorage.getItem(MEME_OF_DAY_KEY);
            const storedTimestamp = localStorage.getItem(MEME_OF_DAY_TIMESTAMP);
            const now = new Date();
            
            // Check if we need to select a new meme (daily)
            const needsNewMeme = !storedMeme || !storedTimestamp || 
                new Date(parseInt(storedTimestamp)).getDate() !== now.getDate();

            if (needsNewMeme && Object.values(categorizedCoins).flat().length > 0) {
                // Select new meme of the day
                const selectedMeme = getMemeOfTheDay(categorizedCoins);
                setMemeOfTheDay(selectedMeme);
                
                // Store in localStorage
                localStorage.setItem(MEME_OF_DAY_KEY, JSON.stringify(selectedMeme));
                localStorage.setItem(MEME_OF_DAY_TIMESTAMP, now.getTime().toString());
            } else if (storedMeme && !needsNewMeme) {
                // Use stored meme
                setMemeOfTheDay(JSON.parse(storedMeme));
            }
        };

        loadMemeOfDay();
    }, [categorizedCoins]); // Only run when categorizedCoins changes

    const currentCoins = categorizedCoins[activeCategory] || [];
    const sortedAndFilteredCoins = [...currentCoins]
        .filter(coin => 
            coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            const multiplier = sortOrder === 'desc' ? -1 : 1;
            return (a[sortBy] - b[sortBy]) * multiplier;
        });

    const hotDeals = Object.values(categorizedCoins)
        .flat()
        .filter(coin => coin.percent_change_24h < -20)
        .filter((coin, index, self) => 
            index === self.findIndex((c) => c.symbol === coin.symbol)
        )
        .filter(coin => !dismissedDeals.has(coin.symbol))
        .sort((a, b) => a.percent_change_24h - b.percent_change_24h);

    const getMemeOfTheDay = (coins) => {
        const allCoins = Object.values(coins).flat();
        
        // Score each coin based on multiple factors
        const scoredCoins = allCoins.map(coin => ({
            ...coin,
            score: (
                (coin.market_cap > 1000000000 ? 3 : 0) + // Large market cap
                (coin.volume_24h > 10000000 ? 2 : 0) + // Good volume
                (Math.abs(coin.percent_change_24h) > 10 ? 2 : 0) + // Significant price movement
                (coin.rank < 100 ? 3 : 0) // Good ranking
            )
        }));

        // Sort by score and get top 5
        const topCoins = scoredCoins
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        // Randomly select one from top 5 to add variety
        return topCoins[Math.floor(Math.random() * topCoins.length)];
    };

    const topGainers = Object.values(categorizedCoins)
        .flat()
        .filter(coin => coin.percent_change_24h > 20)
        .filter((coin, index, self) => 
            index === self.findIndex((c) => c.symbol === coin.symbol)
        )
        .filter(coin => !dismissedGainers.has(coin.symbol))
        .sort((a, b) => b.percent_change_24h - a.percent_change_24h);

    useEffect(() => {
        setVisibleHotDeals(hotDeals.slice(0, 3));
        setVisibleTopGainers(topGainers.slice(0, 3));
    }, [categorizedCoins, dismissedDeals, dismissedGainers]);

    const handleDismissHotDeal = (symbol) => {
        setDismissedDeals(prev => new Set([...prev, symbol]));
    };

    const handleDismissTopGainer = (symbol) => {
        setDismissedGainers(prev => new Set([...prev, symbol]));
    };

    const toggleWatchlist = (coin) => {
        setWatchlist(prev => {
            const isInWatchlist = prev.some(item => item.symbol === coin.symbol);
            const newWatchlist = isInWatchlist
                ? prev.filter(item => item.symbol !== coin.symbol)
                : [...prev, coin];
            
            // Save to localStorage
            localStorage.setItem('memeWatchlist', JSON.stringify(newWatchlist));
            return newWatchlist;
        });
    };

    useEffect(() => {
        const checkAlerts = () => {
            Object.entries(priceAlerts).forEach(([symbol, alert]) => {
                const currentCoin = Object.values(categorizedCoins)
                    .flat()
                    .find(coin => coin.symbol === symbol);

                if (!currentCoin) return;

                const shouldTrigger = 
                    (alert.alertType === 'above' && currentCoin.price >= alert.targetPrice) ||
                    (alert.alertType === 'below' && currentCoin.price <= alert.targetPrice);

                if (shouldTrigger) {
                    // Trigger notification
                    if (alert.notification === 'both' || alert.notification === 'sound') {
                        new Audio('/alert-sound.mp3').play().catch(() => {});
                    }
                    
                    if (alert.notification === 'both' || alert.notification === 'popup') {
                        toast.success(`Price Alert: ${currentCoin.name} is now ${alert.alertType} $${alert.targetPrice}`);
                    }

                    // Remove the triggered alert
                    removeAlert(symbol);
                }
            });
        };

        const interval = setInterval(checkAlerts, 5000); // Check every 5 seconds
        return () => clearInterval(interval);
    }, [categorizedCoins, priceAlerts]);

    const setAlert = (coin, alertSettings) => {
        setPriceAlerts(prev => {
            const newAlerts = {
                ...prev,
                [coin.symbol]: {
                    ...alertSettings,
                    coin
                }
            };
            localStorage.setItem('priceAlerts', JSON.stringify(newAlerts));
            return newAlerts;
        });
    };

    const removeAlert = (symbol) => {
        setPriceAlerts(prev => {
            const newAlerts = { ...prev };
            delete newAlerts[symbol];
            localStorage.setItem('priceAlerts', JSON.stringify(newAlerts));
            return newAlerts;
        });
    };

    useEffect(() => {
        let hideTimeout;
        if (autoHide && showNotifications) {
            hideTimeout = setTimeout(() => {
                setShowNotifications(false);
            }, 10000); // Hide after 10 seconds
        }
        return () => clearTimeout(hideTimeout);
    }, [autoHide, showNotifications]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center justify-center">
                <div className="loading-container">
                    <span className="stars">✨</span>
                    <span className="stars">✨</span>
                    <span className="stars">✨</span>
                    <span className="animate-rocket">🚀</span>
                </div>
                <div className="mt-4 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                    Loading Meme Coins...
                </div>
                <div className="mt-2 text-sm text-gray-400">
                    Preparing for launch 🌙
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
                <div className="text-xl text-red-500">
                    Error: {error}
                    <button 
                        onClick={fetchMemeCoins}
                        className="ml-4 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10 space-y-4">
                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-gradient">
                        🚀 Meme Coin Universe 🌌
                    </h1>
                    <p className="text-gray-300">Track the most popular meme coins in real-time</p>
                </div>

                {/* Add Market Summary */}
                <MarketSummary 
                    coins={categorizedCoins}
                    formatNumber={formatNumber}
                />

                {/* Meme of the Day */}
                <div className="mb-8">
                    <MemeOfTheDay 
                        coin={memeOfTheDay} 
                        formatNumber={formatNumber}
                        formatPercentage={formatPercentage}
                    />
                </div>

                {/* Community Voting Section - Add this before the category tabs */}
                <div className="mb-8 mt-8">
                    <CommunityVoting coins={Object.values(categorizedCoins).flat()} />
                </div>

                {/* Next update timer */}
                {nextUpdate && (
                    <div className="text-center text-sm text-gray-400 mb-4">
                        Next update: {new Date(nextUpdate).toLocaleTimeString()}
                    </div>
                )}

                {/* Category Tabs */}
                <div className="mb-8 overflow-x-auto">
                    <div className="flex space-x-2 min-w-max p-2">
                        {Object.entries(categoryInfo).map(([category, info]) => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                                    activeCategory === category
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-gray-800/50 hover:bg-gray-700/50'
                                }`}
                            >
                                <span>{info.name}</span>
                                <span className="ml-2 text-xs opacity-75">
                                    ({categorizedCoins[category]?.length || 0})
                                </span>
                            </button>
                        ))}
                    </div>
                    <div className="mt-2 text-sm text-gray-400 text-center">
                        {categoryInfo[activeCategory].description}
                    </div>
                </div>

                {/* Search and Filter Controls */}
                <div className="mb-8 p-4 bg-gray-800/50 backdrop-blur-md rounded-xl">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-64">
                            <input
                                type="text"
                                placeholder="Search coins..."
                                className="w-full p-3 pl-10 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <div className="flex gap-4">
                            <select
                                className="p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-all"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="market_cap">Market Cap</option>
                                <option value="price">Price</option>
                                <option value="percent_change_24h">24h Change</option>
                                <option value="volume_24h">Volume</option>
                                <option value="rank">Rank</option>
                            </select>
                            <button
                                className="p-3 rounded-lg bg-gray-700/50 border border-gray-600 hover:bg-gray-600/50 transition-all"
                                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                            >
                                {sortOrder === 'desc' ? '↓' : '↑'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Add watchlist toggle button */}
                <button
                    onClick={() => setIsWatchlistOpen(true)}
                    className="fixed top-4 right-4 bg-purple-500/20 hover:bg-purple-500/30 
                        text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                    <span>Watchlist</span>
                    <span className="bg-purple-500/30 px-2 py-0.5 rounded-full text-sm">
                        {watchlist.length}
                    </span>
                </button>

                {/* Add watchlist panel */}
                <WatchlistPanel
                    watchlist={watchlist}
                    onRemove={toggleWatchlist}
                    isOpen={isWatchlistOpen}
                    onClose={() => setIsWatchlistOpen(false)}
                    formatPrice={formatPrice}
                    formatNumber={formatNumber}
                    formatPercentage={formatPercentage}
                />

                {/* Coin Grid */}
                {sortedAndFilteredCoins.length === 0 ? (
                    <div className="text-center text-xl">
                        No coins found in {categoryInfo[activeCategory].name}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedAndFilteredCoins.map((coin) => (
                            <CoinCard
                                key={coin.symbol}
                                coin={coin}
                                isSelected={selectedCoin?.symbol === coin.symbol}
                                onSelect={() => setSelectedCoin(selectedCoin?.symbol === coin.symbol ? null : coin)}
                                formatPrice={formatPrice}
                                formatNumber={formatNumber}
                                formatPercentage={formatPercentage}
                                selectedCoin={selectedCoin}
                                onWatchlistToggle={toggleWatchlist}
                                isInWatchlist={watchlist.some(item => item.symbol === coin.symbol)}
                                onSetAlert={(coin) => {
                                    setSelectedAlertCoin(coin);
                                    setIsAlertModalOpen(true);
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
            <div className="fixed top-4 right-4 z-50 flex gap-2">
                {/* Tools Quick Access */}
                <div className="flex gap-2 mr-4">
                    <button
                        onClick={() => document.getElementById('profit-calculator').scrollIntoView({ behavior: 'smooth' })}
                        className="bg-gray-800/90 hover:bg-gray-700/90 px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm border border-gray-700"
                        title="Profit Calculator"
                    >
                        💰 Moon Calculator
                    </button>
                    <button
                        onClick={() => document.getElementById('comparison-tool').scrollIntoView({ behavior: 'smooth' })}
                        className="bg-gray-800/90 hover:bg-gray-700/90 px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm border border-gray-700"
                        title="Comparison Tool"
                    >
                        🔍 Meme Battle
                    </button>
                    <button
                        onClick={() => document.getElementById('volume-analysis').scrollIntoView({ behavior: 'smooth' })}
                        className="bg-gray-800/90 hover:bg-gray-700/90 px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm border border-gray-700"
                        title="Volume Analysis"
                    >
                        🔥 Volume Hunter
                    </button>
                </div>

                {/* Existing Alert Controls */}
                <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="bg-gray-800/90 hover:bg-gray-700/90 px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm border border-gray-700"
                >
                    {showNotifications ? '🔇 Hide' : '🔔 Show'} Alerts
                </button>
                <button
                    onClick={() => setAutoHide(!autoHide)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm border ${
                        autoHide 
                            ? 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/50' 
                            : 'bg-gray-800/90 hover:bg-gray-700/90 border-gray-700'
                    }`}
                >
                    {autoHide ? '🕒 Auto-hide On' : '⭕ Auto-hide Off'}
                </button>
            </div>
            {showNotifications && (
                <>
                    <TopGainersNotification 
                        gainers={visibleTopGainers}
                        onDismiss={handleDismissTopGainer}
                        formatPercentage={formatPercentage}
                        formatPrice={formatPrice}
                        formatNumber={formatNumber}
                        remainingCount={topGainers.length - visibleTopGainers.length}
                    />
                    <HotDealsNotification 
                        deals={visibleHotDeals}
                        onDismiss={handleDismissHotDeal}
                        formatPercentage={formatPercentage}
                        formatPrice={formatPrice}
                        formatNumber={formatNumber}
                        remainingCount={hotDeals.length - visibleHotDeals.length}
                    />
                </>
            )}

            {/* Add the alert modal */}
            {isAlertModalOpen && selectedAlertCoin && (
                <PriceAlertModal
                    coin={selectedAlertCoin}
                    onClose={() => {
                        setIsAlertModalOpen(false);
                        setSelectedAlertCoin(null);
                    }}
                    onSetAlert={setAlert}
                />
            )}

            {/* Add active alerts display */}
            <ActiveAlerts
                alerts={priceAlerts}
                onRemoveAlert={removeAlert}
                formatPrice={formatPrice}
            />

            {/* Keep this as the last main component */}
            <div id="profit-calculator" className="mb-8">
                <ProfitCalculator 
                    coins={Object.values(categorizedCoins).flat()}
                    formatNumber={formatNumber}
                    formatPrice={formatPrice}
                />
            </div>

            <div id="comparison-tool" className="mb-8">
                <ComparisonTool 
                    coins={Object.values(categorizedCoins).flat()}
                    formatNumber={formatNumber}
                    formatPrice={formatPrice}
                    formatPercentage={formatPercentage}
                />
            </div>

            <div id="volume-analysis" className="mb-8">
                <VolumeAnalysis 
                    coins={Object.values(categorizedCoins).flat()}
                    formatNumber={formatNumber}
                    formatPrice={formatPrice}
                />
            </div>
        </div>
    );
}

const HotDealsNotification = ({ 
    deals, 
    onDismiss, 
    formatPercentage, 
    formatPrice, 
    formatNumber,
    remainingCount 
}) => {
    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full md:max-w-md">
            {deals.map((deal, index) => (
                <div
                    key={deal.symbol}
                    className="relative bg-gradient-to-r from-red-500/90 to-purple-600/90 backdrop-blur-md p-4 rounded-xl mb-3 
                    shadow-lg transform transition-all duration-500 hover:scale-105 
                    hover:shadow-red-500/50 hover:shadow-2xl hover:from-red-600/90 hover:to-purple-700/90
                    cursor-pointer group"
                    style={{ 
                        animationDelay: `${index * 200}ms`,
                        animation: 'slideIn 0.5s ease-out forwards'
                    }}
                >
                    <button
                        className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full 
                        flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 
                        transition-opacity hover:bg-red-600 z-10"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDismiss(deal.symbol);
                        }}
                    >
                        ×
                    </button>
                    <div className="flex items-center gap-3">
                        <img 
                            src={deal.logo}
                            alt={deal.name}
                            className="w-12 h-12 rounded-full ring-2 ring-white/20 transition-all duration-500 
                            group-hover:rotate-12 group-hover:ring-red-400 group-hover:scale-110"
                            onError={(e) => {
                                e.target.src = '/fallback-coin.png';
                                e.target.onerror = null;
                            }}
                        />
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        🔥 Flash Deal: {deal.name}
                                        <span className="text-xs bg-red-500/50 px-2 py-0.5 rounded-full">
                                            #{deal.rank}
                                        </span>
                                    </h3>
                                    <p className="text-red-200 text-sm">{deal.symbol}</p>
                                </div>
                                <span className="text-red-100 text-xs bg-red-500/30 px-2 py-1 rounded-lg">
                                    24h
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-2 gap-2 bg-black/20 p-2 rounded-lg">
                        <div>
                            <p className="text-xs text-red-200">Current Price</p>
                            <p className="font-mono font-bold text-white">
                                ${formatPrice(deal.price)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-red-200">Price Drop</p>
                            <p className="font-bold text-red-300">
                                ↘ {Math.abs(formatPercentage(deal.percent_change_24h))}%
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-red-200">Market Cap</p>
                            <p className="font-bold text-white">${formatNumber(deal.market_cap)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-red-200">24h Volume</p>
                            <p className="font-bold text-white">${formatNumber(deal.volume_24h)}</p>
                        </div>
                    </div>

                    <div className="mt-3 flex justify-between items-center text-xs text-red-200">
                        <span>Last Updated: {new Date(deal.last_updated).toLocaleTimeString()}</span>
                        <button 
                            className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-all duration-300
                            group-hover:bg-red-500/30 hover:px-5 hover:shadow-lg"
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(getCoinMarketCapUrl(deal), '_blank');
                            }}
                        >
                            View Details →
                        </button>
                    </div>
                </div>
            ))}
            {remainingCount > 0 && (
                <div className="text-center text-sm text-gray-400 mt-2">
                    {remainingCount} more hot deals available
                </div>
            )}
        </div>
    );
};

const MemeOfTheDay = ({ coin, formatNumber, formatPercentage }) => {
    if (!coin) return null;
    
    return (
        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 h-full">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                🎯 Meme Coin of the Day
                <span className="text-sm bg-purple-500/20 px-2 py-1 rounded-full">Featured</span>
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-6">
                <img 
                    src={coin.logo}
                    alt={coin.name}
                    className="w-32 h-32 rounded-full animate-pulse shadow-lg shadow-purple-500/20"
                />
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
                        {coin.name}
                    </h3>
                    <p className="text-purple-400 text-lg">{coin.symbol}</p>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                            <p className="text-gray-400 text-sm">Market Cap</p>
                            <p className="font-bold">${formatNumber(coin.market_cap)}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">24h Change</p>
                            <p className={`font-bold ${coin.percent_change_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {coin.percent_change_24h >= 0 ? '↗' : '↘'} {formatPercentage(coin.percent_change_24h)}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CoinCard = ({ coin, isSelected, onSelect, formatPrice, formatNumber, formatPercentage, selectedCoin, onWatchlistToggle, isInWatchlist, onSetAlert }) => {
    const springProps = useSpring({
        to: {
            transform: isSelected ? 'rotateY(360deg)' : 'rotateY(0deg)'
        },
        config: { duration: 1000 }
    });

    // Generate some mock data for the sparkline
    const generateSparklineData = (currentPrice, volatility = 0.1) => {
        return Array(7).fill(0).map((_, i) => {
            const randomChange = (Math.random() - 0.5) * volatility;
            return currentPrice * (1 + randomChange);
        });
    };

    const sparklineData = generateSparklineData(coin.price);

    const getCoinMarketCapUrl = (coin) => {
        if (coin.slug) {
            return `https://coinmarketcap.com/currencies/${coin.slug}/`;
        }
        // Fallback to ID if slug is not available
        return `https://coinmarketcap.com/currencies/${coin.id}/`;
    };

    return (
        <div
            className="group relative bg-gray-800/50 backdrop-blur-md rounded-xl p-6 hover:transform hover:scale-105 transition-all duration-300 border border-gray-700/50 hover:border-purple-500/50"
            onClick={onSelect}
        >
            {/* Price Change Indicator */}
            <div className={`absolute top-0 right-0 h-1 w-full rounded-t-xl transition-all ${
                coin.percent_change_24h >= 0 ? 'bg-green-500' : 'bg-red-500'
            }`} />

            {/* Coin Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                    <animated.div style={springProps}>
                        <img 
                            src={coin.logo} 
                            alt={coin.name}
                            className="w-16 h-16 rounded-full shadow-lg hover:shadow-purple-500/50"
                            onError={(e) => {
                                e.target.src = '/fallback-coin.png';
                                e.target.onerror = null;
                            }}
                        />
                    </animated.div>
                    <div className="absolute -bottom-2 -right-2 bg-gray-700 rounded-full px-2 py-1 text-xs">
                        #{coin.rank || 'N/A'}
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-bold">{coin.name}</h2>
                    <p className="text-purple-400 font-mono">{coin.symbol}</p>
                </div>
            </div>

            {/* Price Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
                        ${formatPrice(coin.price)}
                    </p>
                    <p className={`text-lg font-bold ${
                        coin.percent_change_24h >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                        {coin.percent_change_24h >= 0 ? '↗' : '↘'} {formatPercentage(coin.percent_change_24h)}%
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-700/30 rounded-lg">
                    <div>
                        <p className="text-gray-400 text-sm">Market Cap</p>
                        <p className="font-bold">${formatNumber(coin.market_cap)}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">24h Volume</p>
                        <p className="font-bold">${formatNumber(coin.volume_24h)}</p>
                    </div>
                </div>

                {/* Tags */}
                {coin.tags && coin.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {coin.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Expanded View */}
            {selectedCoin?.symbol === coin.symbol && (
                <div className="mt-4 p-4 bg-gray-700/30 rounded-lg">
                    <h3 className="text-lg font-bold mb-2">Additional Information</h3>
                    <button 
                        className="mt-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-4 py-2 rounded-lg transition-colors w-full"
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(getCoinMarketCapUrl(coin), '_blank');
                        }}
                    >
                        View on CoinMarketCap →
                    </button>
                </div>
            )}

            <div className="h-20 mt-4">
                <Line
                    data={{
                        labels: ['7d', '6d', '5d', '4d', '3d', '2d', '1d'],
                        datasets: [{
                            data: sparklineData,
                            borderColor: coin.percent_change_24h >= 0 ? '#10B981' : '#EF4444',
                            borderWidth: 2,
                            tension: 0.4,
                            pointRadius: 0,
                            fill: false
                        }]
                    }}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            x: {
                                display: false,
                                grid: {
                                    display: false
                                }
                            },
                            y: {
                                display: false,
                                grid: {
                                    display: false
                                }
                            }
                        },
                        elements: {
                            point: {
                                radius: 0
                            }
                        }
                    }}
                />
            </div>

            {coin.percent_change_24h > 100 && (
                <Confetti
                    width={window.innerWidth}
                    height={window.innerHeight}
                    recycle={false}
                    numberOfPieces={200}
                    gravity={0.3}
                />
            )}

            {/* Add watchlist button */}
            <button
                className={`absolute top-3 right-3 text-2xl transition-colors ${
                    isInWatchlist ? 'text-yellow-500' : 'text-gray-600 group-hover:text-gray-400'
                }`}
                onClick={(e) => {
                    e.stopPropagation();
                    onWatchlistToggle(coin);
                }}
            >
                {isInWatchlist ? '★' : '☆'}
            </button>

            {/* Add this near the watchlist star */}
            <button
                className="absolute top-3 right-12 text-xl transition-colors text-gray-600 group-hover:text-gray-400"
                onClick={(e) => {
                    e.stopPropagation();
                    onSetAlert(coin);
                }}
            >
                🔔
            </button>

            {/* Add Quick Tools Section */}
            <div className="mt-4 grid grid-cols-3 gap-2">
                <a
                    href={`/moon-calculator/${coin.symbol.toLowerCase()}`}
                    className="px-2 py-1 bg-gray-700/30 rounded-lg text-center text-sm hover:bg-purple-500/20 transition-all"
                    onClick={(e) => e.stopPropagation()}
                >
                    💰 Calculator
                </a>
                <a
                    href={`/tools/meme-battle?coin=${coin.symbol.toLowerCase()}`}
                    className="px-2 py-1 bg-gray-700/30 rounded-lg text-center text-sm hover:bg-purple-500/20 transition-all"
                    onClick={(e) => e.stopPropagation()}
                >
                    ⚔️ Compare
                </a>
                <a
                    href={`/converter/${coin.symbol.toLowerCase()}/usd`}
                    className="px-2 py-1 bg-gray-700/30 rounded-lg text-center text-sm hover:bg-purple-500/20 transition-all"
                    onClick={(e) => e.stopPropagation()}
                >
                    💱 Convert
                </a>
            </div>
        </div>
    );
};

// Add this new component
const TopGainersNotification = ({ 
    gainers, 
    onDismiss, 
    formatPercentage, 
    formatPrice, 
    formatNumber,
    remainingCount 
}) => {
    return (
        <div className="fixed bottom-4 left-4 z-50 max-w-sm w-full md:max-w-md">
            {gainers.map((gainer, index) => (
                <div
                    key={gainer.symbol}
                    className="relative bg-gradient-to-r from-green-500/90 to-blue-600/90 backdrop-blur-md p-4 rounded-xl mb-3 
                    shadow-lg transform transition-all duration-500 hover:scale-105 
                    hover:shadow-green-500/50 hover:shadow-2xl hover:from-green-600/90 hover:to-blue-700/90
                    cursor-pointer group"
                    style={{ 
                        animationDelay: `${index * 200}ms`,
                        animation: 'slideInFromLeft 0.5s ease-out forwards'
                    }}
                >
                    <button
                        className="absolute -top-2 -right-2 bg-green-500 text-white w-6 h-6 rounded-full 
                        flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 
                        transition-opacity hover:bg-green-600 z-10"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDismiss(gainer.symbol);
                        }}
                    >
                        ×
                    </button>
                    <div className="flex items-center gap-3">
                        <img 
                            src={gainer.logo}
                            alt={gainer.name}
                            className="w-12 h-12 rounded-full ring-2 ring-white/20 transition-all duration-500 
                            group-hover:rotate-12 group-hover:ring-green-400 group-hover:scale-110"
                            onError={(e) => {
                                e.target.src = '/fallback-coin.png';
                                e.target.onerror = null;
                            }}
                        />
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        🚀 Top Gainer: {gainer.name}
                                        <span className="text-xs bg-green-500/50 px-2 py-0.5 rounded-full">
                                            #{gainer.rank}
                                        </span>
                                    </h3>
                                    <p className="text-green-200 text-sm">{gainer.symbol}</p>
                                </div>
                                <span className="text-green-100 text-xs bg-green-500/30 px-2 py-1 rounded-lg">
                                    24h
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-2 gap-2 bg-black/20 p-2 rounded-lg">
                        <div>
                            <p className="text-xs text-green-200">Current Price</p>
                            <p className="font-mono font-bold text-white">
                                ${formatPrice(gainer.price)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-green-200">Price Gain</p>
                            <p className="font-bold text-green-300">
                                ↗ {formatPercentage(gainer.percent_change_24h)}%
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-green-200">Market Cap</p>
                            <p className="font-bold text-white">${formatNumber(gainer.market_cap)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-green-200">24h Volume</p>
                            <p className="font-bold text-white">${formatNumber(gainer.volume_24h)}</p>
                        </div>
                    </div>

                    <div className="mt-3 flex justify-between items-center text-xs text-green-200">
                        <span>Last Updated: {new Date(gainer.last_updated).toLocaleTimeString()}</span>
                        <button 
                            className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-all duration-300
                            group-hover:bg-green-500/30 hover:px-5 hover:shadow-lg"
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(getCoinMarketCapUrl(gainer), '_blank');
                            }}
                        >
                            View Details →
                        </button>
                    </div>
                </div>
            ))}
            {remainingCount > 0 && (
                <div className="text-center text-sm text-gray-400 mt-2">
                    {remainingCount} more top gainers available
                </div>
            )}
        </div>
    );
};

const WatchlistPanel = ({ 
    watchlist, 
    onRemove, 
    isOpen, 
    onClose,
    formatPrice,
    formatNumber,
    formatPercentage 
}) => {
    const getCoinMarketCapUrl = (coin) => {
        if (coin.slug) {
            return `https://coinmarketcap.com/currencies/${coin.slug}/`;
        }
        return `https://coinmarketcap.com/currencies/${coin.id}/`;
    };

    return (
        <div className={`fixed right-0 top-0 h-full w-80 bg-gray-800/95 backdrop-blur-lg transform transition-transform duration-300 shadow-2xl z-50 
            ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        👀 Watchlist
                        <span className="text-sm bg-purple-500/20 px-2 py-1 rounded-full">
                            {watchlist.length}
                        </span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>
                
                {watchlist.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                        <p>No coins in watchlist</p>
                        <p className="text-sm mt-2">Click the star icon on any coin to add it</p>
                    </div>
                ) : (
                    <div className="space-y-4 max-h-[calc(100vh-100px)] overflow-y-auto">
                        {watchlist.map(coin => (
                            <div
                                key={coin.symbol}
                                className="bg-gray-700/50 rounded-lg p-3 hover:bg-gray-700/70 transition-all duration-300 
                                transform hover:scale-105 cursor-pointer group relative"
                                onClick={() => window.open(getCoinMarketCapUrl(coin), '_blank')}
                            >
                                {/* Add hover tooltip */}
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 px-2 py-1 
                                    rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    Click to view on CoinMarketCap
                                </div>

                                <div className="flex items-center gap-3">
                                    <img
                                        src={coin.logo}
                                        alt={coin.name}
                                        className="w-8 h-8 rounded-full group-hover:rotate-12 transition-transform duration-300"
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <span className="font-semibold">{coin.name}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onRemove(coin);
                                                }}
                                                className="text-yellow-500 hover:text-yellow-300 transform hover:scale-125 
                                                transition-all duration-300"
                                            >
                                                ★
                                            </button>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">{coin.symbol}</span>
                                            <span className={`${
                                                coin.percent_change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                                            } font-medium`}>
                                                {coin.percent_change_24h >= 0 ? '↗' : '↘'} {formatPercentage(coin.percent_change_24h)}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-baseline mt-1">
                                            <span className="text-sm text-purple-300">${formatPrice(coin.price)}</span>
                                            <span className="text-xs text-gray-400">
                                                Vol: ${formatNumber(coin.volume_24h)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Add subtle indicator for clickability */}
                                <div className="absolute bottom-1 right-1 text-gray-500 opacity-0 group-hover:opacity-50 text-xs">
                                    🔗
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const PriceAlertModal = ({ coin, onClose, onSetAlert }) => {
    const [targetPrice, setTargetPrice] = useState(coin.price);
    const [alertType, setAlertType] = useState('above');
    const [notification, setNotification] = useState('both');
    const [percentageMode, setPercentageMode] = useState(false);
    const [percentage, setPercentage] = useState(10);

    // Calculate suggested price targets
    const suggestedTargets = {
        above: [
            { label: '+5%', value: coin.price * 1.05 },
            { label: '+10%', value: coin.price * 1.10 },
            { label: '+25%', value: coin.price * 1.25 },
            { label: '+50%', value: coin.price * 1.50 },
            { label: '+100%', value: coin.price * 2 },
        ],
        below: [
            { label: '-5%', value: coin.price * 0.95 },
            { label: '-10%', value: coin.price * 0.90 },
            { label: '-25%', value: coin.price * 0.75 },
            { label: '-50%', value: coin.price * 0.50 },
            { label: '-75%', value: coin.price * 0.25 },
        ]
    };

    // Update target price when percentage changes
    useEffect(() => {
        if (percentageMode) {
            const multiplier = alertType === 'above' ? (1 + percentage/100) : (1 - percentage/100);
            setTargetPrice(coin.price * multiplier);
        }
    }, [percentage, alertType, percentageMode, coin.price]);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-800/95 p-6 rounded-xl w-[450px] shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-6">
                    <img src={coin.logo} alt={coin.name} className="w-12 h-12 rounded-full" />
                    <div className="flex-1">
                        <h3 className="text-xl font-bold">{coin.name}</h3>
                        <div className="flex justify-between items-baseline">
                            <p className="text-gray-400 text-sm">Current Price: ${coin.price.toFixed(6)}</p>
                            <p className={`text-sm ${coin.percent_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                24h: {coin.percent_change_24h.toFixed(2)}%
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1 text-gray-300">Alert Type</label>
                        <select 
                            className="w-full bg-gray-700/50 rounded-lg p-2 border border-gray-600"
                            value={alertType}
                            onChange={(e) => setAlertType(e.target.value)}
                        >
                            <option value="above">Price Goes Above</option>
                            <option value="below">Price Goes Below</option>
                        </select>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm text-gray-300">Target Price</label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-400">Use Percentage</span>
                                <button
                                    onClick={() => setPercentageMode(!percentageMode)}
                                    className={`w-12 h-6 rounded-full transition-colors ${
                                        percentageMode ? 'bg-purple-500' : 'bg-gray-600'
                                    }`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                                        percentageMode ? 'translate-x-7' : 'translate-x-1'
                                    }`} />
                                </button>
                            </div>
                        </div>

                        {percentageMode ? (
                            <div className="space-y-2">
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    value={percentage}
                                    onChange={(e) => setPercentage(Number(e.target.value))}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-sm text-gray-400">
                                    <span>{percentage}%</span>
                                    <span>${targetPrice.toFixed(6)}</span>
                                </div>
                            </div>
                        ) : (
                            <input 
                                type="number"
                                value={targetPrice}
                                onChange={(e) => setTargetPrice(Number(e.target.value))}
                                className="w-full bg-gray-700/50 rounded-lg p-2 border border-gray-600"
                                step="0.000001"
                                min="0"
                            />
                        )}
                    </div>

                    {/* Quick Select Buttons */}
                    <div>
                        <label className="block text-sm mb-2 text-gray-300">Quick Select</label>
                        <div className="flex flex-wrap gap-2">
                            {suggestedTargets[alertType].map(target => (
                                <button
                                    key={target.label}
                                    onClick={() => setTargetPrice(target.value)}
                                    className="px-3 py-1 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 text-sm"
                                >
                                    {target.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-gray-300">Notification Type</label>
                        <select 
                            className="w-full bg-gray-700/50 rounded-lg p-2 border border-gray-600"
                            value={notification}
                            onChange={(e) => setNotification(e.target.value)}
                        >
                            <option value="both">Sound & Popup</option>
                            <option value="sound">Sound Only</option>
                            <option value="popup">Popup Only</option>
                        </select>
                    </div>

                    {/* Preview */}
                    <div className="bg-gray-700/30 p-3 rounded-lg">
                        <p className="text-sm text-gray-300">Alert Preview:</p>
                        <p className="text-sm">
                            Alert me when {coin.name} price goes {alertType}{' '}
                            <span className="text-purple-400">${targetPrice.toFixed(6)}</span>
                            {percentageMode && (
                                <span className="text-gray-400">
                                    {' '}({alertType === 'above' ? '+' : '-'}{percentage}% from current)
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => {
                                onSetAlert(coin, {
                                    targetPrice: parseFloat(targetPrice),
                                    alertType,
                                    notification,
                                    createdAt: new Date().toISOString()
                                });
                                onClose();
                            }}
                            className="px-4 py-2 bg-purple-500 rounded-lg hover:bg-purple-600"
                        >
                            Set Alert
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ActiveAlerts = ({ alerts, onRemoveAlert, formatPrice }) => {
    return (
        <div className="fixed left-4 top-20 z-50 max-w-sm">
            {Object.entries(alerts).map(([symbol, alert]) => (
                <div 
                    key={symbol}
                    className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 mb-2 shadow-lg border border-gray-700"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-yellow-500">⚡</span>
                                <span className="font-semibold">{alert.coin.name}</span>
                            </div>
                            <p className="text-sm text-gray-400">
                                Alert when price goes {alert.alertType}{' '}
                                ${formatPrice(alert.targetPrice)}
                            </p>
                        </div>
                        <button
                            onClick={() => onRemoveAlert(symbol)}
                            className="text-gray-500 hover:text-red-500"
                        >
                            ×
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
