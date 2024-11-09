import MoonCalculatorWrapper from '@/components/MoonCalculatorWrapper';
import USDConverterWrapper from '@/components/USDConverterWrapper';

export const metadata = {
    title: 'Meme Coin Calculator | USD Converter | Profit Calculator',
    description: 'Free calculator for meme coins. Convert any amount to USD, calculate profits, and track potential returns. Perfect for Dogecoin, SHIB, and all meme coins.',
    keywords: 'meme coin calculator, crypto converter, USD calculator, dogecoin calculator, shiba inu calculator, crypto profit calculator',
};

export default async function MoonCalculatorPage() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/memecoins`);
    const { data: categorizedCoins } = await response.json();
    
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <nav className="text-sm text-gray-400 mb-8">
                    <a href="/" className="hover:text-purple-400">Home</a>
                    <span className="mx-2">/</span>
                    <span>Moon Calculator</span>
                </nav>

                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-4">💰 Ultimate Meme Coin Calculator</h1>
                    <p className="text-gray-300 text-lg mb-4">
                        All-in-one calculator for meme coins. Convert to USD, calculate profits, and plan your moon mission!
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Main Calculator */}
                    <div className="space-y-8">
                        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6">
                            <h2 className="text-xl font-bold mb-4">🌙 Moon Mission Planner</h2>
                            <p className="text-gray-300 mb-4">Calculate potential returns and plan your exit strategy</p>
                            <MoonCalculatorWrapper coins={Object.values(categorizedCoins).flat()} />
                        </div>

                        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6">
                            <h2 className="text-xl font-bold mb-4">💱 Quick USD Converter</h2>
                            <p className="text-gray-300 mb-4">Instantly convert any meme coin amount to USD value</p>
                            <USDConverterWrapper coins={Object.values(categorizedCoins).flat()} />
                        </div>
                    </div>

                    {/* Sidebar with Additional Info */}
                    <div className="space-y-8">
                        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6">
                            <h2 className="text-xl font-bold mb-4">📈 Popular Calculations</h2>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-700/30 rounded-lg">
                                    <h3 className="font-bold text-purple-400">If Coin Hits $1</h3>
                                    <p className="text-sm text-gray-300">Calculate your profits if your favorite meme coin reaches $1</p>
                                </div>
                                <div className="p-4 bg-gray-700/30 rounded-lg">
                                    <h3 className="font-bold text-purple-400">Investment Returns</h3>
                                    <p className="text-sm text-gray-300">See potential returns based on your investment amount</p>
                                </div>
                                <div className="p-4 bg-gray-700/30 rounded-lg">
                                    <h3 className="font-bold text-purple-400">USD Value Tracker</h3>
                                    <p className="text-sm text-gray-300">Track the real-time USD value of your holdings</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6">
                            <h2 className="text-xl font-bold mb-4">❓ FAQ</h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-bold text-purple-400">How accurate is the calculator?</h3>
                                    <p className="text-sm text-gray-300">Our calculator uses real-time price data from major exchanges for accurate calculations.</p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-purple-400">What coins are supported?</h3>
                                    <p className="text-sm text-gray-300">We support all major meme coins including Dogecoin, Shiba Inu, Pepe, and many more.</p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-purple-400">How often are prices updated?</h3>
                                    <p className="text-sm text-gray-300">Prices are updated in real-time to ensure accurate calculations.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6">
                            <h2 className="text-xl font-bold mb-4">⚠️ Disclaimer</h2>
                            <p className="text-sm text-gray-300">
                                This calculator provides estimates based on current market data. Actual results may vary
                                due to market conditions, fees, slippage, and other factors. Always do your own research
                                and invest responsibly.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 