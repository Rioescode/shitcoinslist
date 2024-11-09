export const metadata = {
    title: 'Meme Coin Converter | Real-time Cryptocurrency Calculator',
    description: 'Convert any meme coin to USD, EUR, GBP and more. Real-time rates for Dogecoin, SHIB, PEPE, and all popular meme coins. Free and accurate cryptocurrency converter.',
    keywords: 'meme coin converter, crypto calculator, dogecoin converter, shiba inu calculator, cryptocurrency converter',
};

export default async function ConverterPage() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memecoins`);
    const { data: categorizedCoins } = await response.json();
    const allCoins = Object.values(categorizedCoins).flat();

    // Get top coins by market cap
    const topCoins = allCoins
        .sort((a, b) => b.market_cap - a.market_cap)
        .slice(0, 6);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                        Meme Coin Converter
                    </h1>
                    <p className="text-xl text-gray-300">
                        Convert any meme coin to USD, EUR, GBP and more with real-time rates
                    </p>
                </header>

                {/* Popular Conversions */}
                <section className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
                    <h2 className="text-2xl font-bold mb-6">Popular Conversions</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {topCoins.map(coin => (
                            <a
                                key={coin.id}
                                href={`/converter/${coin.symbol.toLowerCase()}/usd`}
                                className="bg-gray-700/30 p-4 rounded-lg hover:bg-gray-700/50 transition-all text-center group"
                            >
                                <img 
                                    src={coin.logo}
                                    alt={coin.name}
                                    className="w-12 h-12 rounded-full mx-auto mb-2 group-hover:scale-110 transition-transform"
                                />
                                <div className="font-bold">{coin.symbol}/USD</div>
                                <div className="text-sm text-gray-400">${coin.price.toFixed(6)}</div>
                            </a>
                        ))}
                    </div>
                </section>

                {/* Currency Options */}
                <section className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
                    <h2 className="text-2xl font-bold mb-6">Available Currencies</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY'].map(currency => (
                            <div key={currency} className="bg-gray-700/30 p-4 rounded-lg">
                                <div className="font-bold">{currency}</div>
                                <div className="text-sm text-gray-400">
                                    {currency === 'USD' ? 'US Dollar' :
                                     currency === 'EUR' ? 'Euro' :
                                     currency === 'GBP' ? 'British Pound' :
                                     currency === 'JPY' ? 'Japanese Yen' :
                                     currency === 'AUD' ? 'Australian Dollar' :
                                     currency === 'CAD' ? 'Canadian Dollar' :
                                     currency === 'CHF' ? 'Swiss Franc' :
                                     'Chinese Yuan'}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Features */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
                        <h3 className="text-xl font-bold mb-3">⚡ Real-time Rates</h3>
                        <p className="text-gray-300">
                            Get instant conversions with live market data from major exchanges
                        </p>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
                        <h3 className="text-xl font-bold mb-3">🌐 Multiple Currencies</h3>
                        <p className="text-gray-300">
                            Convert between USD, EUR, GBP, and other major currencies
                        </p>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
                        <h3 className="text-xl font-bold mb-3">📊 Market Data</h3>
                        <p className="text-gray-300">
                            View detailed market stats and historical comparisons
                        </p>
                    </div>
                </section>

                {/* SEO Content */}
                <section className="bg-gray-800/50 backdrop-blur-md rounded-xl p-8 border border-gray-700/50 prose prose-invert max-w-none">
                    <h2>Free Cryptocurrency Converter</h2>
                    <p>
                        Our free cryptocurrency converter helps you quickly calculate values between meme coins
                        and major world currencies. Whether you're trading Dogecoin, Shiba Inu, or any other
                        meme coin, our converter provides accurate, real-time conversions.
                    </p>
                    
                    <h2>Why Use Our Converter?</h2>
                    <ul>
                        <li>Real-time price updates from major exchanges</li>
                        <li>Support for all popular meme coins</li>
                        <li>Multiple currency options</li>
                        <li>Historical price comparisons</li>
                        <li>Detailed market analysis</li>
                    </ul>

                    <h2>How to Use the Converter</h2>
                    <ol>
                        <li>Select your meme coin from our extensive list</li>
                        <li>Choose your target currency (USD, EUR, etc.)</li>
                        <li>Enter the amount you want to convert</li>
                        <li>Get instant results with real-time rates</li>
                    </ol>
                </section>
            </div>
        </div>
    );
} 