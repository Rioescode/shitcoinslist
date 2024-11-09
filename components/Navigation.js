'use client';

export default function Navigation() {
    return (
        <nav className="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo/Home with better contrast */}
                    <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <span className="text-2xl">💩</span>
                        <span className="font-bold text-xl text-white">
                            ShitcoinsList<span className="text-purple-400">.com</span>
                        </span>
                    </a>

                    {/* Main Navigation with improved visibility */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Tools Dropdown */}
                        <div className="relative group">
                            <button className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-purple-500/20 text-white transition-all">
                                🛠️ Tools
                                <span className="ml-1 opacity-60">▾</span>
                            </button>
                            <div className="absolute top-full left-0 w-48 py-2 bg-gray-800/95 backdrop-blur-md rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all border border-gray-700/50">
                                <a href="/tools/moon-calculator" className="flex items-center gap-2 px-4 py-2 hover:bg-purple-500/20 text-white">
                                    💰 Moon Calculator
                                </a>
                                <a href="/tools/meme-battle" className="flex items-center gap-2 px-4 py-2 hover:bg-purple-500/20 text-white">
                                    ⚔️ Meme Battle
                                </a>
                                <a href="/tools/volume-hunter" className="flex items-center gap-2 px-4 py-2 hover:bg-purple-500/20 text-white">
                                    🔥 Volume Hunter
                                </a>
                                <a href="/converter" className="flex items-center gap-2 px-4 py-2 hover:bg-purple-500/20 text-white">
                                    💱 Converter
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu Button with better contrast */}
                    <button className="md:hidden p-2 rounded-lg bg-gray-800/50 hover:bg-purple-500/20 text-white transition-all">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu with improved visibility */}
            <div className="md:hidden bg-gray-800/95 backdrop-blur-md border-t border-gray-700/50">
                <div className="px-2 pt-2 pb-3 space-y-1">
                    <a href="/tools/moon-calculator" className="block px-4 py-2 rounded-lg hover:bg-purple-500/20 text-white transition-all">
                        💰 Moon Calculator
                    </a>
                    <a href="/tools/meme-battle" className="block px-4 py-2 rounded-lg hover:bg-purple-500/20 text-white transition-all">
                        ⚔️ Meme Battle
                    </a>
                    <a href="/tools/volume-hunter" className="block px-4 py-2 rounded-lg hover:bg-purple-500/20 text-white transition-all">
                        🔥 Volume Hunter
                    </a>
                    <a href="/converter" className="block px-4 py-2 rounded-lg hover:bg-purple-500/20 text-white transition-all">
                        💱 Converter
                    </a>
                </div>
            </div>
        </nav>
    );
} 