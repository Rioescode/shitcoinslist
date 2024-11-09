import { Suspense } from 'react';
import MemeMarketOverview from '@/components/MemeMarketOverview';
import TopGainers from '@/components/TopGainers';
import CommunityVote from '@/components/CommunityVote';
import MemeOfTheDay from '@/components/MemeOfTheDay';
import Loading from './loading';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        🚀 Meme Coin Universe 🌙
                    </h1>
                    <p className="text-gray-300">
                        Track the most popular meme coins in real-time
                    </p>
                </div>

                <Suspense fallback={<Loading />}>
                    <MemeMarketOverview />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <TopGainers />
                        <div className="space-y-8">
                            <MemeOfTheDay />
                            <CommunityVote />
                        </div>
                    </div>
                </Suspense>
            </div>
        </main>
    );
}
