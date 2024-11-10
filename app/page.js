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
    const [activeFilters, setActiveFilters] = useState([]);
    const [percentageFilter, setPercentageFilter] = useState({ min: null, max: null });

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

            const response = await fetch('/api/memecoins', {
                cache: 'no-store'
            });
            const result = await response.json();
            
            if (result.error) {
                throw new Error(result.error);
            }
            
            setCategorizedCoins(result.data || {});
            setNextUpdate(result.nextUpdate);
            
        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
            setCategorizedCoins({
                top: [],
                mid: [],
                new: [],
                trending: [],
                other: []
            });
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

    // Define filters object first
    const filters = {
        gainers_24h: coin => coin.percent_change_24h >= 20,
        gainers_7d: coin => coin.percent_change_7d >= 50,
        dips_24h: coin => coin.percent_change_24h <= -20,
        high_volume: coin => coin.volume_24h / coin.market_cap > 0.3,
        low_cap: coin => coin.market_cap < 10000000,
        trending: coin => coin.volume_24h > coin.market_cap * 0.5,
        volatile: coin => Math.abs(coin.percent_change_24h) > 30,
        stable: coin => Math.abs(coin.percent_change_24h) < 5
    };

    // Handle filter selection
    const handleFilterSelect = (filterId) => {
        setActiveFilters(prev => {
            if (prev.includes(filterId)) {
                return prev.filter(f => f !== filterId);
            }
            return [...prev, filterId];
        });
    };

    // Then use filters in filteredAndSearchedCoins
    const filteredAndSearchedCoins = currentCoins
        .filter(coin => 
            (coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (activeFilters.length === 0 || activeFilters.some(filterId => filters[filterId](coin))) &&
            (!percentageFilter.min || !percentageFilter.max || 
                (coin.percent_change_24h >= percentageFilter.min && 
                 coin.percent_change_24h <= percentageFilter.max))
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
                (coin.volume_24h > 1000000 ? 2 : 0) + // Good volume
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
                <div className="mt-4 text-2xl font-bold text-white">
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
            <div className="max-w-7xl mx-auto pt-16">
                <div className="text-center mb-10 space-y-4">
                    <h1 className="text-5xl font-bold text-white">
                        🚀 Shit Coins List 🌌
                    </h1>
                    <p className="text-gray-300">Track the most popular meme coins in real-time</p>
                </div>

                <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md shadow-lg">
                    <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
                        {/* Site name with hover effect */}
                        <div className="text-xl font-bold group cursor-pointer">
                            <span className="text-white inline-flex items-center gap-2 group-hover:scale-105 transition-transform">
                                <span className="animate-bounce">💩</span> ShitcoinsList
                            </span>
                            <span className="text-purple-500 group-hover:text-purple-400 transition-colors">.com</span>
                        </div>

                        <div className="flex justify-end gap-2">
                            {/* Tools Quick Access */}
                            <div className="flex gap-2 mr-4">
                                <button
                                    onClick={() => document.getElementById('profit-calculator').scrollIntoView({ behavior: 'smooth' })}
                                    className="bg-gray-800/90 hover:bg-gray-700/90 px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm border border-gray-700 hover:scale-105 transition-all group"
                                    title="Profit Calculator"
                                >
                                    <span className="group-hover:rotate-12 transition-transform inline-block">💰</span>
                                    <span>Moon Calculator</span>
                                </button>
                                <button
                                    onClick={() => document.getElementById('comparison-tool').scrollIntoView({ behavior: 'smooth' })}
                                    className="bg-gray-800/90 hover:bg-gray-700/90 px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm border border-gray-700 hover:scale-105 transition-all group"
                                    title="Comparison Tool"
                                >
                                    <span className="group-hover:rotate-12 transition-transform inline-block">🔍</span>
                                    <span>Meme Battle</span>
                                </button>
                                <button
                                    onClick={() => document.getElementById('volume-analysis').scrollIntoView({ behavior: 'smooth' })}
                                    className="bg-gray-800/90 hover:bg-gray-700/90 px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm border border-gray-700 hover:scale-105 transition-all group"
                                    title="Volume Analysis"
                                >
                                    <span className="group-hover:rotate-12 transition-transform inline-block">🔥</span>
                                    <span>Volume Hunter</span>
                                </button>
                            </div>

                            {/* Watchlist button with animation */}
                            <button
                                onClick={() => setIsWatchlistOpen(true)}
                                className="bg-gray-800/90 hover:bg-gray-700/90 px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm border border-gray-700 hover:scale-105 transition-all group"
                            >
                                <span className="group-hover:rotate-12 transition-transform inline-block">👀</span>
                                <span>Watchlist</span>
                                <span className="bg-purple-500/30 px-2 py-0.5 rounded-full text-sm group-hover:bg-purple-500/50 transition-colors">
                                    {watchlist.length}
                                </span>
                            </button>

                            {/* Alert Controls with animations */}
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="bg-gray-800/90 hover:bg-gray-700/90 px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm border border-gray-700 hover:scale-105 transition-all group"
                            >
                                <span className={`transition-transform inline-block ${showNotifications ? 'rotate-0' : 'rotate-12'}`}>
                                    {showNotifications ? '🔇' : '🔔'}
                                </span>
                                <span>{showNotifications ? 'Hide' : 'Show'} Alerts</span>
                            </button>
                            <button
                                onClick={() => setAutoHide(!autoHide)}
                                className={`px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm border transition-all hover:scale-105 group ${
                                    autoHide 
                                        ? 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/50' 
                                        : 'bg-gray-800/90 hover:bg-gray-700/90 border-gray-700'
                                }`}
                            >
                                <span className="group-hover:rotate-12 transition-transform inline-block">
                                    {autoHide ? '🕒' : '⭕'}
                                </span>
                                <span>Auto-hide {autoHide ? 'On' : 'Off'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Add Market Summary */}
                <MarketSummary 
                    coins={categorizedCoins}
                    formatNumber={formatNumber}
                />

                {/* Add Latest Coins Timeline */}
                <LatestCoinsTimeline coins={Object.values(categorizedCoins).flat()} />

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

                {/* Add Filter Bubbles */}
                <FilterBubbles 
                    onFilterSelect={handleFilterSelect}
                    activeFilters={activeFilters}
                    filters={filters}
                />

                {/* Search and Filter Controls */}
                <div className="mb-8 p-4 bg-gray-800/50 backdrop-blur-md rounded-xl">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        {/* Existing search input */}
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
                            {/* Add custom percentage filter */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder="Min %"
                                    className="w-24 p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-all"
                                    onChange={(e) => setPercentageFilter(prev => ({ ...prev, min: Number(e.target.value) }))}
                                />
                                <span className="text-gray-400">to</span>
                                <input
                                    type="number"
                                    placeholder="Max %"
                                    className="w-24 p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-all"
                                    onChange={(e) => setPercentageFilter(prev => ({ ...prev, max: Number(e.target.value) }))}
                                />
                            </div>

                            {/* Existing percentage dropdown */}
                            <select
                                className="p-3 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-all"
                                onChange={(e) => {
                                    const [min, max] = e.target.value.split(',').map(Number);
                                    setPercentageFilter({ min, max });
                                }}
                                defaultValue=""
                            >
                                <option value="">Quick Filters</option>
                                <option value="50,999999">+50% or more 🚀</option>
                                <option value="20,50">+20% to +50% 📈</option>
                                <option value="10,20">+10% to +20% ⬆️</option>
                                <option value="0,10">0% to +10% ↗️</option>
                                <option value="-10,0">-10% to 0% ↘️</option>
                                <option value="-20,-10">-20% to -10% ⬇️</option>
                                <option value="-999999,-20">-20% or less 💥</option>
                            </select>

                            {/* Existing sort controls */}
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
                {filteredAndSearchedCoins.length === 0 ? (
                    <div className="text-center text-xl">
                        No coins found in {categoryInfo[activeCategory].name}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAndSearchedCoins.map((coin) => (
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

            {/* Add these new sections to track emerging trends and potential moonshots */}

            <TrendingSignals coins={Object.values(categorizedCoins).flat()} />

            <WhaleWatchlist coins={Object.values(categorizedCoins).flat()} />

            {selectedCoin && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <MoodMeter coin={selectedCoin} />
                    <MemeMaker coin={selectedCoin} />
                </div>
            )}
            {selectedCoin && <Achievements coin={selectedCoin} />}
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
    // Calculate recovery potential (0-100)
    const calculateRecoveryPotential = (coin) => {
        const priceDropSeverity = Math.min(100, Math.abs(coin.percent_change_24h));
        const volumeSupport = Math.min(100, (coin.volume_24h / coin.market_cap) * 100);
        const marketStability = coin.market_cap > 100000000 ? 100 : 
                              coin.market_cap > 10000000 ? 75 : 50;
        
        return Math.round((priceDropSeverity + volumeSupport + marketStability) / 3);
    };

    // Calculate buy pressure (0-100)
    const calculateBuyPressure = (coin) => {
        const volumeIntensity = (coin.volume_24h / coin.market_cap) > 0.3;
        const priceStability = Math.abs(coin.percent_change_24h) < 30;
        const marketCapStrength = coin.market_cap > 50000000;
        
        let score = 0;
        if (volumeIntensity) score += 40;
        if (priceStability) score += 30;
        if (marketCapStrength) score += 30;
        
        return score;
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 w-full max-w-[calc(100%-2rem)] md:max-w-md">
            {deals.map((deal, index) => {
                const recoveryPotential = calculateRecoveryPotential(deal);
                const buyPressure = calculateBuyPressure(deal);
                
                return (
                    <div key={deal.symbol} 
                        className="relative bg-gradient-to-r from-red-500/90 to-purple-600/90 backdrop-blur-md p-3 md:p-4 rounded-xl mb-3 
                        shadow-lg transform transition-all duration-500 hover:scale-105 cursor-pointer group text-sm md:text-base">
                        {/* Make the header clickable */}
                        <a 
                            href={`https://coinmarketcap.com/currencies/${deal.slug || deal.id}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-2 hover:opacity-80 transition-opacity">
                                <img 
                                    src={deal.logo}
                                    alt={deal.name}
                                    className="w-10 h-10 rounded-full"
                                />
                                <div>
                                    <h3 className="font-bold text-white">{deal.name}</h3>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-red-200">{deal.symbol}</span>
                                        <span className="text-red-200">•</span>
                                        <span className="text-red-200">${formatPrice(deal.price)}</span>
                                    </div>
                                </div>
                                <div className="ml-auto text-right">
                                    <div className="text-white font-bold">{formatPercentage(deal.percent_change_24h)}%</div>
                                    <div className="text-xs text-red-200">24h Change</div>
                                </div>
                            </div>
                        </a>
                        {/* Rest of your existing content */}
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <div className="bg-black/30 p-2 rounded-lg">
                                <div className="text-xs text-red-200">Recovery Potential</div>
                                <div className="flex items-center">
                                    <div className="h-2 flex-1 bg-gray-700 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-red-400 transition-all duration-500"
                                            style={{ width: `${recoveryPotential}%` }}
                                        />
                                    </div>
                                    <span className="ml-2 text-sm font-bold">{recoveryPotential}</span>
                                </div>
                            </div>
                            <div className="bg-black/30 p-2 rounded-lg">
                                <div className="text-xs text-red-200">Buy Pressure</div>
                                <div className="flex items-center">
                                    <div className="h-2 flex-1 bg-gray-700 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-purple-400 transition-all duration-500"
                                            style={{ width: `${buyPressure}%` }}
                                        />
                                    </div>
                                    <span className="ml-2 text-sm font-bold">{buyPressure}</span>
                                </div>
                            </div>
                        </div>

                        {/* Add Market Signals */}
                        <div className="mt-2 flex gap-2">
                            {recoveryPotential > 70 && (
                                <span className="text-xs bg-red-500/30 px-2 py-1 rounded-full">
                                    ⚡ Strong Recovery Potential
                                </span>
                            )}
                            {buyPressure > 70 && (
                                <span className="text-xs bg-purple-500/30 px-2 py-1 rounded-full">
                                    💪 High Buy Pressure
                                </span>
                            )}
                            {Math.abs(deal.percent_change_24h) > 30 && (
                                <span className="text-xs bg-yellow-500/30 px-2 py-1 rounded-full">
                                    🎯 Oversold
                                </span>
                            )}
                        </div>

                        {/* Add Market Analysis */}
                        <div className="mt-2 text-xs text-red-200">
                            <div className="flex items-center gap-2">
                                <span>Market Analysis:</span>
                                {Math.abs(deal.percent_change_24h) > 50 ? '💥 Major Dip Opportunity' :
                                 Math.abs(deal.percent_change_24h) > 30 ? '📉 Significant Drop' :
                                 '🔍 Price Correction'}
                            </div>
                        </div>
                    </div>
                );
            })}
            
            {remainingCount > 0 && (
                <div className="text-center text-sm text-gray-400 mt-2">
                    {remainingCount} more opportunities available
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

    // Add analytics calculations
    const calculateMomentumScore = () => {
        const volumeScore = Math.min(100, (coin.volume_24h / coin.market_cap) * 100);
        const priceScore = Math.min(100, coin.percent_change_24h);
        const marketCapScore = coin.market_cap > 1000000000 ? 100 : 
                             coin.market_cap > 100000000 ? 75 : 50;
        
        return Math.round((volumeScore + priceScore + marketCapScore) / 3);
    };

    const calculateBreakoutPotential = () => {
        const volumeSpike = (coin.volume_24h / coin.market_cap) > 0.5;
        const priceMovement = coin.percent_change_24h > 20;
        const marketCapRoom = coin.market_cap < 1000000000;
        
        let score = 0;
        if (volumeSpike) score += 40;
        if (priceMovement) score += 30;
        if (marketCapRoom) score += 30;
        
        return score;
    };

    const momentumScore = calculateMomentumScore();
    const breakoutPotential = calculateBreakoutPotential();

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
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/moon-calculator/${coin.symbol.toLowerCase()}`;
                    }}
                    className="px-2 py-1 bg-gray-700/30 rounded-lg text-center text-sm hover:bg-purple-500/20 transition-all"
                >
                    💰 Calculator
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/converter/${coin.symbol.toLowerCase()}/usd`;
                    }}
                    className="px-2 py-1 bg-gray-700/30 rounded-lg text-center text-sm hover:bg-purple-500/20 transition-all"
                >
                    💱 Convert
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/compare/${coin.symbol.toLowerCase()}`;
                    }}
                    className="px-2 py-1 bg-gray-700/30 rounded-lg text-center text-sm hover:bg-purple-500/20 transition-all"
                >
                    ⚔️ Compare
                </button>
            </div>

            {/* Add Analytics Section */}
            <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="bg-black/30 p-2 rounded-lg">
                    <div className="text-xs text-gray-400">Momentum Score</div>
                    <div className="flex items-center">
                        <div className="h-1.5 flex-1 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-green-400 transition-all duration-500"
                                style={{ width: `${momentumScore}%` }}
                            />
                        </div>
                        <span className="ml-2 text-sm font-bold">{momentumScore}</span>
                    </div>
                </div>
                <div className="bg-black/30 p-2 rounded-lg">
                    <div className="text-xs text-gray-400">Breakout Potential</div>
                    <div className="flex items-center">
                        <div className="h-1.5 flex-1 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-blue-400 transition-all duration-500"
                                style={{ width: `${breakoutPotential}%` }}
                            />
                        </div>
                        <span className="ml-2 text-sm font-bold">{breakoutPotential}</span>
                    </div>
                </div>
            </div>

            {/* Add Market Signals */}
            <div className="mt-2 flex flex-wrap gap-1">
                {momentumScore > 70 && (
                    <span className="text-xs bg-green-500/30 px-2 py-0.5 rounded-full">
                        🚀 Strong Momentum
                    </span>
                )}
                {breakoutPotential > 70 && (
                    <span className="text-xs bg-blue-500/30 px-2 py-0.5 rounded-full">
                        💫 Breakout Potential
                    </span>
                )}
                {(coin.volume_24h / coin.market_cap) > 0.5 && (
                    <span className="text-xs bg-purple-500/30 px-2 py-0.5 rounded-full">
                        🌊 High Volume
                    </span>
                )}
                {Math.abs(coin.percent_change_24h) > 30 && (
                    <span className="text-xs bg-yellow-500/30 px-2 py-0.5 rounded-full">
                        ⚡ Volatile
                    </span>
                )}
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
    // Calculate momentum score (0-100)
    const calculateMomentumScore = (coin) => {
        const volumeScore = Math.min(100, (coin.volume_24h / coin.market_cap) * 100);
        const priceScore = Math.min(100, coin.percent_change_24h);
        const marketCapScore = coin.market_cap > 1000000000 ? 100 : 
                             coin.market_cap > 100000000 ? 75 : 50;
        
        return Math.round((volumeScore + priceScore + marketCapScore) / 3);
    };

    // Calculate breakout potential (0-100)
    const calculateBreakoutPotential = (coin) => {
        const volumeSpike = (coin.volume_24h / coin.market_cap) > 0.5;
        const priceMovement = coin.percent_change_24h > 20;
        const marketCapRoom = coin.market_cap < 1000000000;
        
        let score = 0;
        if (volumeSpike) score += 40;
        if (priceMovement) score += 30;
        if (marketCapRoom) score += 30;
        
        return score;
    };

    return (
        <div className="fixed bottom-4 left-4 z-50 w-full max-w-[calc(100%-2rem)] md:max-w-md">
            {gainers.map((gainer, index) => {
                const momentumScore = calculateMomentumScore(gainer);
                const breakoutPotential = calculateBreakoutPotential(gainer);
                
                return (
                    <div key={gainer.symbol} 
                        className="relative bg-gradient-to-r from-green-500/90 to-blue-600/90 backdrop-blur-md p-3 md:p-4 rounded-xl mb-3 
                        shadow-lg transform transition-all duration-500 hover:scale-105 cursor-pointer group text-sm md:text-base">
                        {/* Make the header clickable */}
                        <a 
                            href={`https://coinmarketcap.com/currencies/${gainer.slug || gainer.id}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-2 hover:opacity-80 transition-opacity">
                                <img 
                                    src={gainer.logo}
                                    alt={gainer.name}
                                    className="w-10 h-10 rounded-full"
                                />
                                <div>
                                    <h3 className="font-bold text-white">{gainer.name}</h3>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-green-200">{gainer.symbol}</span>
                                        <span className="text-green-200">•</span>
                                        <span className="text-green-200">${formatPrice(gainer.price)}</span>
                                    </div>
                                </div>
                                <div className="ml-auto text-right">
                                    <div className="text-white font-bold">+{formatPercentage(gainer.percent_change_24h)}%</div>
                                    <div className="text-xs text-green-200">24h Change</div>
                                </div>
                            </div>
                        </a>
                        {/* Rest of the content remains unchanged */}
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <div className="bg-black/30 p-2 rounded-lg">
                                <div className="text-xs text-green-200">Momentum Score</div>
                                <div className="flex items-center">
                                    <div className="h-2 flex-1 bg-gray-700 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-green-400 transition-all duration-500"
                                            style={{ width: `${momentumScore}%` }}
                                        />
                                    </div>
                                    <span className="ml-2 text-sm font-bold">{momentumScore}</span>
                                </div>
                            </div>
                            <div className="bg-black/30 p-2 rounded-lg">
                                <div className="text-xs text-green-200">Breakout Potential</div>
                                <div className="flex items-center">
                                    <div className="h-2 flex-1 bg-gray-700 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-blue-400 transition-all duration-500"
                                            style={{ width: `${breakoutPotential}%` }}
                                        />
                                    </div>
                                    <span className="ml-2 text-sm font-bold">{breakoutPotential}</span>
                                </div>
                            </div>
                        </div>

                        {/* Add Trading Signals */}
                        <div className="mt-2 flex gap-2">
                            {momentumScore > 70 && (
                                <span className="text-xs bg-green-500/30 px-2 py-1 rounded-full">
                                    🚀 Strong Momentum
                                </span>
                            )}
                            {breakoutPotential > 70 && (
                                <span className="text-xs bg-blue-500/30 px-2 py-1 rounded-full">
                                    💫 Potential Breakout
                                </span>
                            )}
                            {(gainer.volume_24h / gainer.market_cap) > 0.5 && (
                                <span className="text-xs bg-purple-500/30 px-2 py-1 rounded-full">
                                    🌊 High Volume
                                </span>
                            )}
                        </div>

                        {/* Add Community Sentiment */}
                        <div className="mt-2 text-xs text-green-200">
                            <div className="flex items-center gap-2">
                                <span>Community Sentiment:</span>
                                {gainer.percent_change_24h > 50 ? '🔥 Very Bullish' :
                                 gainer.percent_change_24h > 20 ? ' Bullish' :
                                 '👍 Positive'}
                            </div>
                        </div>
                    </div>
                );
            })}
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

// Add these new sections to track emerging trends and potential moonshots

const TrendingSignals = ({ coins }) => {
    // Calculate social momentum score
    const calculateSocialScore = (coin) => {
        const volumeSpike = (coin.volume_24h / coin.market_cap) > 0.3;
        const priceMovement = coin.percent_change_24h > 15;
        const marketCapGrowth = coin.market_cap > coin.market_cap_24h_ago;
        
        let score = 0;
        if (volumeSpike) score += 35;
        if (priceMovement) score += 35;
        if (marketCapGrowth) score += 30;
        return score;
    };

    // Get emerging coins with high potential
    const getEmergingCoins = () => {
        return coins.filter(coin => {
            const socialScore = calculateSocialScore(coin);
            return socialScore > 70 && coin.market_cap < 100000000; // Less than 100M market cap
        }).sort((a, b) => calculateSocialScore(b) - calculateSocialScore(a));
    };

    const emergingCoins = getEmergingCoins();

    return (
        <div className="mb-8 bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-6">🔥 Trending Signals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {emergingCoins.map(coin => (
                    <div key={coin.id} className="bg-gray-700/30 p-4 rounded-lg hover:bg-gray-700/50 transition-all">
                        <div className="flex items-center gap-3 mb-2">
                            <img src={coin.logo} alt={coin.name} className="w-8 h-8 rounded-full" />
                            <div>
                                <h3 className="font-bold">{coin.name}</h3>
                                <p className="text-sm text-gray-400">{coin.symbol}</p>
                            </div>
                            <div className="ml-auto">
                                <span className={`text-sm ${coin.percent_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {coin.percent_change_24h >= 0 ? '↗' : '↘'} {Math.abs(coin.percent_change_24h).toFixed(2)}%
                                </span>
                            </div>
                        </div>

                        {/* Trend Indicators */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {coin.volume_24h / coin.market_cap > 0.3 && (
                                <span className="text-xs bg-blue-500/30 px-2 py-1 rounded-full">
                                    🌊 High Volume
                                </span>
                            )}
                            {coin.percent_change_24h > 15 && (
                                <span className="text-xs bg-green-500/30 px-2 py-1 rounded-full">
                                    📈 Breaking Out
                                </span>
                            )}
                            {coin.market_cap < 50000000 && (
                                <span className="text-xs bg-purple-500/30 px-2 py-1 rounded-full">
                                    💎 Low Cap Gem
                                </span>
                            )}
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                            <div>
                                <span className="text-gray-400">Market Cap:</span>
                                <span className="ml-1">${new Intl.NumberFormat('en-US', {
                                    notation: 'compact',
                                    maximumFractionDigits: 1
                                }).format(coin.market_cap)}</span>
                            </div>
                            <div>
                                <span className="text-gray-400">Volume:</span>
                                <span className="ml-1">${new Intl.NumberFormat('en-US', {
                                    notation: 'compact',
                                    maximumFractionDigits: 1
                                }).format(coin.volume_24h)}</span>
                            </div>
                        </div>

                        {/* Trend Analysis */}
                        <div className="mt-3 text-sm text-gray-300">
                            <p>{coin.name} shows {
                                coin.volume_24h / coin.market_cap > 0.5 ? 'extremely high' :
                                coin.volume_24h / coin.market_cap > 0.3 ? 'significant' :
                                'moderate'
                            } trading activity with {
                                Math.abs(coin.percent_change_24h) > 20 ? 'strong' :
                                Math.abs(coin.percent_change_24h) > 10 ? 'moderate' :
                                'stable'
                            } price movement.</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const WhaleWatchlist = ({ coins }) => {
    // Track significant wallet movements
    const getWhaleMovements = () => {
        return coins.filter(coin => {
            const largeTransactions = coin.volume_24h > 1000000; // $1M+ volume
            const priceImpact = Math.abs(coin.percent_change_24h) > 10;
            return largeTransactions && priceImpact;
        }).sort((a, b) => b.volume_24h - a.volume_24h);
    };

    const whaleMovements = getWhaleMovements();

    return (
        <div className="mb-8 bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-6">🐋 Whale Watch</h2>
            <div className="space-y-4">
                {whaleMovements.map(coin => (
                    <div key={coin.id} className="bg-gray-700/30 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img src={coin.logo} alt={coin.name} className="w-8 h-8 rounded-full" />
                                <div>
                                    <h3 className="font-bold">{coin.name}</h3>
                                    <p className="text-sm text-gray-400">{coin.symbol}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`font-bold ${coin.percent_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {coin.percent_change_24h >= 0 ? '+' : ''}{coin.percent_change_24h.toFixed(2)}%
                                </div>
                                <div className="text-sm text-gray-400">24h Change</div>
                            </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-gray-400">24h Volume</div>
                                <div className="font-bold">${new Intl.NumberFormat('en-US', {
                                    notation: 'compact',
                                    maximumFractionDigits: 1
                                }).format(coin.volume_24h)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-400">Market Impact</div>
                                <div className="font-bold">
                                    {(coin.volume_24h / coin.market_cap * 100).toFixed(1)}%
                                </div>
                            </div>
                        </div>

                        {/* Movement Analysis */}
                        <div className="mt-3 text-sm">
                            <span className="text-purple-400">Analysis: </span>
                            <span className="text-gray-300">
                                {coin.volume_24h > coin.market_cap * 0.5 ? 'Major whale movement' :
                                 coin.volume_24h > coin.market_cap * 0.3 ? 'Significant activity' :
                                 'Notable transactions'} detected with {
                                    Math.abs(coin.percent_change_24h) > 20 ? 'high' :
                                    Math.abs(coin.percent_change_24h) > 10 ? 'moderate' :
                                    'low'
                                } price impact.
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const FilterBubbles = ({ onFilterSelect, activeFilters, filters }) => {
    const filtersList = [
        { id: 'gainers_24h', label: '🚀 24h +20%' },
        { id: 'gainers_7d', label: '📈 7d +50%' },
        { id: 'dips_24h', label: '💥 24h -20%' },
        { id: 'high_volume', label: '💫 High Volume' },
        { id: 'low_cap', label: '💎 Low Cap <$10M' },
        { id: 'trending', label: '🔥 Trending' },
        { id: 'volatile', label: '⚡ Volatile' },
        { id: 'stable', label: '🛡️ Stable' }
    ];

    return (
        <div className="mb-6 overflow-x-auto">
            <div className="flex gap-2 p-2 min-w-max">
                {filtersList.map(filter => (
                    <button
                        key={filter.id}
                        onClick={() => onFilterSelect(filter.id)}
                        className={`px-4 py-2 rounded-full transition-all ${
                            activeFilters.includes(filter.id)
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300'
                        }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

const MemeMaker = ({ coin }) => {
    if (!coin) return null;

    return (
        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-4">🎭 Meme Factory</h2>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/30 p-4 rounded-lg text-center cursor-pointer hover:bg-gray-600/50">
                    <span className="text-4xl">🚀</span>
                    <p className="mt-2">When {coin.symbol} hits $1</p>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg text-center cursor-pointer hover:bg-gray-600/50">
                    <span className="text-4xl">💎</span>
                    <p className="mt-2">Diamond Hands</p>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg text-center cursor-pointer hover:bg-gray-600/50">
                    <span className="text-4xl">🌙</span>
                    <p className="mt-2">To The Moon!</p>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg text-center cursor-pointer hover:bg-gray-600/50">
                    <span className="text-4xl">🐋</span>
                    <p className="mt-2">Whale Alert</p>
                </div>
            </div>
        </div>
    );
};

const Achievements = ({ coin }) => {
    if (!coin) return null;

    const achievements = [
        {
            icon: "🎯",
            title: "Early Bird",
            description: "Spotted before 1000% gain",
            unlocked: coin.percent_change_24h > 1000
        },
        {
            icon: "🔥",
            title: "Trending Master",
            description: "Top gainer 3 days in a row",
            unlocked: false
        },
        {
            icon: "🐳",
            title: "Whale Watcher",
            description: "Spotted major whale movement",
            unlocked: coin.volume_24h > coin.market_cap
        },
        {
            icon: "💎",
            title: "Diamond Hands",
            description: "Held through 50% dip",
            unlocked: coin.percent_change_24h < -50
        }
    ];

    return (
        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-4">🏆 Achievements</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {achievements.map((achievement) => (
                    <div 
                        key={achievement.title}
                        className={`relative p-4 rounded-lg text-center ${
                            achievement.unlocked 
                                ? 'bg-purple-500/20 border border-purple-500/50' 
                                : 'bg-gray-700/30 opacity-50'
                        }`}
                    >
                        <span className="text-3xl">{achievement.icon}</span>
                        <h3 className="font-bold mt-2">{achievement.title}</h3>
                        <p className="text-sm text-gray-400">{achievement.description}</p>
                        {!achievement.unlocked && (
                            <div className="absolute inset-0 bg-gray-900/50 rounded-lg flex items-center justify-center">
                                🔒
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const MoodMeter = ({ coin }) => {
    if (!coin) return null;

    const getMood = () => {
        if (coin.percent_change_24h > 20) return { emoji: "🚀", text: "To The Moon!" };
        if (coin.percent_change_24h > 10) return { emoji: "🎉", text: "Party Time!" };
        if (coin.percent_change_24h > 0) return { emoji: "😊", text: "Optimistic" };
        if (coin.percent_change_24h > -10) return { emoji: "😐", text: "Holding Strong" };
        if (coin.percent_change_24h > -20) return { emoji: "😰", text: "Sweating" };
        return { emoji: "😱", text: "Panic Mode" };
    };

    const mood = getMood();

    return (
        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-4">😄 Community Mood</h2>
            <div className="text-center">
                <div className="text-6xl mb-4 animate-bounce">{mood.emoji}</div>
                <div className="text-xl font-bold">{mood.text}</div>
                <div className="mt-4 bg-gray-700/30 rounded-full h-2">
                    <div 
                        className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full transition-all"
                        style={{ 
                            width: `${Math.min(100, Math.max(0, (coin.percent_change_24h + 20) * 2.5))}%` 
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

// Add this component after the MarketSummary and before Meme of the Day
const LatestMemeCoins = ({ coins }) => {
    // Get coins from the last 7 days
    const getLatestCoins = () => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Sort by listing date first, then filter
        return coins
            .filter(coin => {
                // Check if listing_date exists and is valid
                if (!coin.listing_date) return false;
                const listingDate = new Date(coin.listing_date);
                return !isNaN(listingDate) && listingDate > sevenDaysAgo;
            })
            .sort((a, b) => {
                // Sort by listing date, newest first
                const dateA = new Date(a.listing_date);
                const dateB = new Date(b.listing_date);
                return dateB - dateA;
            })
            .slice(0, 5); // Show top 5 newest coins
    };

    const latestCoins = getLatestCoins();

    if (latestCoins.length === 0) {
        return (
            <div className="mb-8 bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        🆕 Fresh Memes Just Dropped
                        <span className="text-sm bg-purple-500/20 px-2 py-1 rounded-full animate-pulse">
                            Hot Off The Chain! 🔥
                        </span>
                    </h2>
                    <span className="text-sm bg-purple-500/20 px-3 py-1 rounded-full">
                        Showing {latestCoins.length} of {latestCoins.length} coins
                    </span>
                </div>
                <div className="text-center text-gray-400 py-8">
                    No new coins listed in the last 7 days
                </div>
            </div>
        );
    }

    return (
        <div className="mb-8 bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    🆕 Fresh Memes Just Dropped
                    <span className="text-sm bg-purple-500/20 px-2 py-1 rounded-full animate-pulse">
                        Hot Off The Chain! 🔥
                    </span>
                </h2>
                <span className="text-sm bg-purple-500/20 px-3 py-1 rounded-full">
                    Showing {latestCoins.length} of {latestCoins.length} coins
                </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {latestCoins.map(coin => (
                    <a
                        key={coin.id}
                        href={`https://coinmarketcap.com/currencies/${coin.slug || coin.id}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-700/30 p-4 rounded-lg hover:bg-gray-700/50 transition-all group relative"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <img 
                                src={coin.logo} 
                                alt={coin.name} 
                                className="w-8 h-8 rounded-full group-hover:scale-110 transition-transform"
                                onError={(e) => {
                                    e.target.src = '/fallback-coin.png';
                                    e.target.onerror = null;
                                }}
                            />
                            <div>
                                <h3 className="font-bold group-hover:text-purple-400 transition-colors">{coin.name}</h3>
                                <p className="text-sm text-gray-400">{coin.symbol}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <p className="text-gray-400">Price</p>
                                <p className="font-mono">${coin.price.toFixed(6)}</p>
                            </div>
                            <div>
                                <p className="text-gray-400">24h</p>
                                <p className={coin.percent_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                                    {coin.percent_change_24h >= 0 ? '↗' : '↘'} {Math.abs(coin.percent_change_24h).toFixed(2)}%
                                </p>
                            </div>
                        </div>
                        {/* Add listing date with relative time */}
                        <div className="mt-2 text-xs text-gray-400">
                            Listed: {new Date(coin.listing_date).toLocaleDateString()} ({
                                Math.floor((new Date() - new Date(coin.listing_date)) / (1000 * 60 * 60 * 24))
                            } days ago)
                        </div>
                        {/* Add "NEW" badge */}
                        <div className="absolute top-2 right-2">
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs animate-pulse">
                                NEW
                            </span>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

const LatestCoinsTimeline = ({ coins }) => {
    const [newListings, setNewListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [displayCount, setDisplayCount] = useState(12); // Initially show 12 coins

    useEffect(() => {
        const fetchNewListings = async () => {
            try {
                const response = await fetch('/api/newmemecoins');
                const data = await response.json();
                if (data.status === 'success') {
                    setNewListings(data.data || []);
                }
            } catch (error) {
                console.error('Error fetching new listings:', error);
                setNewListings([]);
            } finally {
                setLoading(false);
            }
        };

        fetchNewListings();
    }, []);

    const showMore = () => {
        setDisplayCount(prev => prev + 12); // Show 12 more coins when clicked
    };

    const visibleCoins = newListings.slice(0, displayCount);
    const remainingCount = newListings.length - displayCount;

    return (
        <div className="mb-8 space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        🆕 Fresh Memes Just Dropped
                        <span className="text-sm bg-purple-500/20 px-2 py-1 rounded-full animate-pulse">
                            Hot Off The Chain! 🔥
                        </span>
                    </h2>
                    <span className="text-sm bg-purple-500/20 px-3 py-1 rounded-full">
                        Showing {visibleCoins.length} of {newListings.length} coins
                    </span>
                </div>
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin text-2xl">🔄</div>
                        <p className="mt-2 text-gray-400">Fetching latest coins...</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                            {visibleCoins.map(coin => (
                                <a
                                    key={coin.id}
                                    href={`https://coinmarketcap.com/currencies/${coin.slug}/`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-gray-700/30 p-4 rounded-lg hover:bg-gray-700/50 transition-all group relative"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <img 
                                            src={coin.logo} 
                                            alt={coin.name} 
                                            className="w-8 h-8 rounded-full group-hover:scale-110 transition-transform"
                                            onError={(e) => {
                                                e.target.src = '/fallback-coin.png';
                                                e.target.onerror = null;
                                            }}
                                        />
                                        <div>
                                            <h3 className="font-bold group-hover:text-purple-400 transition-colors">{coin.name}</h3>
                                            <p className="text-sm text-gray-400">{coin.symbol}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <p className="text-gray-400">Price</p>
                                            <p className="font-mono">${coin.price.toFixed(6)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">24h</p>
                                            <p className={coin.percent_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                                                {coin.percent_change_24h >= 0 ? '↗' : '↘'} {Math.abs(coin.percent_change_24h).toFixed(2)}%
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-400">
                                        Listed: {new Date(coin.date_added).toLocaleDateString()} ({
                                            Math.floor((new Date() - new Date(coin.date_added)) / (1000 * 60 * 60 * 24))
                                        } days ago)
                                    </div>
                                    <div className="absolute top-2 right-2">
                                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs animate-pulse">
                                            NEW
                                        </span>
                                    </div>
                                </a>
                            ))}
                        </div>
                        {remainingCount > 0 && (
                            <div className="text-center mt-8">
                                <button
                                    onClick={showMore}
                                    className="px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-all duration-300 group"
                                >
                                    <span className="mr-2">Show {Math.min(12, remainingCount)} More</span>
                                    <span className="text-sm text-purple-400 group-hover:text-purple-300">
                                        ({remainingCount} remaining)
                                    </span>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

