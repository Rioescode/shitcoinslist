'use client';

import { useState, useEffect } from 'react';

export default function CommunityVoting({ coins }) {
    const [votes, setVotes] = useState(() => {
        // Load votes from localStorage
        if (typeof window !== 'undefined') {
            return JSON.parse(localStorage.getItem('communityVotes') || '{}');
        }
        return {};
    });
    const [userVoted, setUserVoted] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('userVotedToday') === 'true';
        }
        return false;
    });
    const [timeUntilNextVote, setTimeUntilNextVote] = useState('');

    useEffect(() => {
        const checkVotingPeriod = () => {
            const lastVoteTime = localStorage.getItem('lastVoteTime');
            if (lastVoteTime) {
                const timeElapsed = Date.now() - parseInt(lastVoteTime);
                const cooldownPeriod = 24 * 60 * 60 * 1000; // 24 hours
                
                if (timeElapsed < cooldownPeriod) {
                    setUserVoted(true);
                    const timeLeft = cooldownPeriod - timeElapsed;
                    const hours = Math.floor(timeLeft / (60 * 60 * 1000));
                    const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
                    setTimeUntilNextVote(`${hours}h ${minutes}m`);
                } else {
                    setUserVoted(false);
                    localStorage.removeItem('userVotedToday');
                    localStorage.removeItem('lastVoteTime');
                }
            }
        };

        checkVotingPeriod();
        const interval = setInterval(checkVotingPeriod, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    const handleVote = (coinId) => {
        if (userVoted) return;

        setVotes(prev => {
            const newVotes = {
                ...prev,
                [coinId]: (prev[coinId] || 0) + 1
            };
            localStorage.setItem('communityVotes', JSON.stringify(newVotes));
            return newVotes;
        });

        setUserVoted(true);
        localStorage.setItem('userVotedToday', 'true');
        localStorage.setItem('lastVoteTime', Date.now().toString());
    };

    // Sort coins by votes
    const sortedCoins = [...coins]
        .map(coin => ({
            ...coin,
            voteCount: votes[coin.id] || 0
        }))
        .sort((a, b) => b.voteCount - a.voteCount)
        .slice(0, 5); // Show top 5

    return (
        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 relative z-10">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">🗳️ Community Vote</h2>
                {userVoted && (
                    <span className="text-sm text-gray-400">
                        Next vote in: {timeUntilNextVote}
                    </span>
                )}
            </div>

            <div className="space-y-4">
                {sortedCoins.map((coin) => (
                    <div 
                        key={coin.id}
                        className="bg-gray-700/30 rounded-lg p-4 transition-all hover:bg-gray-700/50"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img 
                                    src={coin.logo}
                                    alt={coin.name}
                                    className="w-8 h-8 rounded-full"
                                />
                                <div>
                                    <h3 className="font-semibold">{coin.name}</h3>
                                    <p className="text-sm text-gray-400">{coin.symbol}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <div className="text-xl font-bold">{coin.voteCount}</div>
                                    <div className="text-xs text-gray-400">votes</div>
                                </div>
                                <button
                                    onClick={() => handleVote(coin.id)}
                                    disabled={userVoted}
                                    className={`px-4 py-2 rounded-lg transition-all ${
                                        userVoted
                                            ? 'bg-gray-600 cursor-not-allowed'
                                            : 'bg-purple-500 hover:bg-purple-600'
                                    }`}
                                >
                                    Vote
                                </button>
                            </div>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="mt-3 bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-purple-500 h-full rounded-full transition-all"
                                style={{
                                    width: `${(coin.voteCount / Math.max(...sortedCoins.map(c => c.voteCount))) * 100}%`
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {userVoted && (
                <div className="mt-4 text-center text-sm text-gray-400">
                    You've already voted today. Come back tomorrow!
                </div>
            )}
        </div>
    );
} 