export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto text-center">
                <h1 className="text-4xl font-bold mb-4">Coin Not Found</h1>
                <p className="text-gray-400 mb-8">
                    The meme coin you're looking for doesn't exist or has been removed.
                </p>
                <a 
                    href="/"
                    className="inline-block px-6 py-3 bg-purple-500 rounded-lg hover:bg-purple-600 transition-colors"
                >
                    Back to Home
                </a>
            </div>
        </div>
    );
} 