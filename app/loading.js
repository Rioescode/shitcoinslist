export default function Loading() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto text-center">
                <h1 className="text-4xl font-bold mb-4">Loading Meme Coins...</h1>
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-700 rounded w-3/4 mx-auto"></div>
                    <div className="h-8 bg-gray-700 rounded w-1/2 mx-auto"></div>
                    <div className="h-8 bg-gray-700 rounded w-2/3 mx-auto"></div>
                </div>
            </div>
        </div>
    );
} 