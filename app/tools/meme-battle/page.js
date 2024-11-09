import MemeBattleWrapper from '@/components/MemeBattleWrapper';

export const metadata = {
    title: 'Meme Battle | Compare Meme Coins Side by Side',
    description: 'Compare meme coins head-to-head. Analyze price, market cap, volume, and more with our advanced comparison tool.',
    keywords: 'meme coin comparison, crypto comparison, meme battle, coin analysis, compare cryptocurrencies',
};

export default async function MemeBattlePage() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memecoins`);
    const { data: categorizedCoins } = await response.json();
    
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <nav className="text-sm text-gray-400 mb-8">
                    <a href="/" className="hover:text-purple-400">Home</a>
                    <span className="mx-2">/</span>
                    <span>Meme Battle</span>
                </nav>

                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-4">⚔ Meme Battle</h1>
                    <p className="text-gray-300">Compare meme coins head-to-head and analyze their performance</p>
                </div>

                <MemeBattleWrapper coins={Object.values(categorizedCoins).flat()} />
            </div>
        </div>
    );
} 