import VolumeHunterWrapper from '@/components/VolumeHunterWrapper';

export const metadata = {
    title: 'Volume Spike Hunter | Track Unusual Meme Coin Trading Activity',
    description: 'Detect and analyze unusual trading volume in meme coins. Find potential breakouts and market movements early.',
    keywords: 'volume analysis, trading volume, meme coins, volume spikes, market analysis, unusual volume',
};

export default async function VolumeHunterPage() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memecoins`);
    const { data: categorizedCoins } = await response.json();
    
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <nav className="text-sm text-gray-400 mb-8">
                    <a href="/" className="hover:text-purple-400">Home</a>
                    <span className="mx-2">/</span>
                    <span>Volume Spike Hunter</span>
                </nav>

                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-4">🔥 Volume Spike Hunter</h1>
                    <p className="text-gray-300">Track and analyze unusual trading volume in the meme coin market</p>
                </div>

                <VolumeHunterWrapper coins={Object.values(categorizedCoins).flat()} />
            </div>
        </div>
    );
} 