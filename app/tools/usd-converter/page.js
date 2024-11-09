import USDConverterWrapper from '@/components/USDConverterWrapper';

export const metadata = {
    title: 'Meme Coin to USD Converter | Real-time Crypto Calculator',
    description: 'Convert any meme coin to USD instantly. Real-time rates for Dogecoin, SHIB, PEPE, and all popular meme coins. Free and accurate cryptocurrency converter.',
    keywords: 'meme coin converter, crypto to usd, dogecoin calculator, shiba inu price, cryptocurrency converter, meme token calculator',
};

export default async function USDConverterPage() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memecoins`);
    const { data: categorizedCoins } = await response.json();
    
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <nav className="text-sm text-gray-400 mb-8">
                    <a href="/" className="hover:text-purple-400">Home</a>
                    <span className="mx-2">/</span>
                    <span>USD Converter</span>
                </nav>

                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-4">💱 Meme Coin to USD Converter</h1>
                    <p className="text-gray-300 text-lg">
                        Convert any meme coin to USD or calculate how many coins you can get for your dollars.
                        Real-time rates for all popular meme coins.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Main Converter */}
                    <div className="space-y-8">
                        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6">
                            <h2 className="text-xl font-bold mb-4">Quick Converter</h2>
                            <USDConverterWrapper coins={Object.values(categorizedCoins).flat()} />
                        </div>
                    </div>

                    {/* Sidebar with Info */}
                    <div className="space-y-8">
                        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6">
                            <h2 className="text-xl font-bold mb-4">Popular Conversions</h2>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-700/30 rounded-lg">
                                    <h3 className="font-bold text-purple-400">Dogecoin to USD</h3>
                                    <p className="text-sm text-gray-300">Convert DOGE to dollars instantly</p>
                                </div>
                                <div className="p-4 bg-gray-700/30 rounded-lg">
                                    <h3 className="font-bold text-purple-400">SHIB to USD</h3>
                                    <p className="text-sm text-gray-300">Calculate Shiba Inu token value</p>
                                </div>
                                <div className="p-4 bg-gray-700/30 rounded-lg">
                                    <h3 className="font-bold text-purple-400">PEPE to USD</h3>
                                    <p className="text-sm text-gray-300">Convert PEPE tokens to dollars</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6">
                            <h2 className="text-xl font-bold mb-4">❓ FAQ</h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-bold text-purple-400">How accurate are the conversions?</h3>
                                    <p className="text-sm text-gray-300">Our converter uses real-time price data from major exchanges to ensure accuracy.</p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-purple-400">Which coins are supported?</h3>
                                    <p className="text-sm text-gray-300">We support all major meme coins including Dogecoin, Shiba Inu, Pepe, and many more.</p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-purple-400">How often are rates updated?</h3>
                                    <p className="text-sm text-gray-300">Exchange rates are updated in real-time to provide the most current conversions.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6">
                            <h2 className="text-xl font-bold mb-4">⚡ Features</h2>
                            <ul className="space-y-2 text-gray-300">
                                <li>• Real-time exchange rates</li>
                                <li>• Bi-directional conversion (Coin ↔ USD)</li>
                                <li>• Support for all major meme coins</li>
                                <li>• Easy-to-use interface</li>
                                <li>• Accurate up to 8 decimal places</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* SEO Content */}
                <div className="mt-8 prose prose-invert max-w-none">
                    <h2>Free Meme Coin to USD Converter</h2>
                    <p>
                        Our free cryptocurrency converter helps you quickly calculate the USD value of your meme coins
                        or determine how many coins you can get for your dollars. Whether you're trading Dogecoin,
                        Shiba Inu, or any other meme coin, our converter provides accurate, real-time conversions.
                    </p>
                    
                    <h2>Why Use Our Converter?</h2>
                    <ul>
                        <li>Real-time price data from major exchanges</li>
                        <li>Support for all popular meme coins</li>
                        <li>Easy to use interface</li>
                        <li>Accurate calculations</li>
                        <li>No registration required</li>
                    </ul>

                    <h2>Popular Meme Coin Conversions</h2>
                    <p>
                        Looking to convert popular meme coins like Dogecoin, Shiba Inu, or PEPE to USD? Our converter
                        supports all major meme coins and provides instant, accurate conversions. Simply enter the
                        amount, select your coin, and get the current USD value in real-time.
                    </p>
                </div>
            </div>
        </div>
    );
} 