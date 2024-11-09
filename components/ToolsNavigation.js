'use client';

export default function ToolsNavigation() {
    const tools = [
        {
            id: 'moon-calculator',
            icon: '💰',
            title: 'Moon Calculator',
            description: 'Calculate potential returns',
            url: '/tools/moon-calculator'
        },
        {
            id: 'meme-battle',
            icon: '⚔️',
            title: 'Meme Battle',
            description: 'Compare with other coins',
            url: '/tools/meme-battle'
        },
        {
            id: 'volume-hunter',
            icon: '🔥',
            title: 'Volume Spike Hunter',
            description: 'Track unusual volume activity',
            url: '/tools/volume-hunter'
        },
        {
            id: 'converter',
            icon: '💱',
            title: 'USD Converter',
            description: 'Convert any coin to USD',
            url: '/converter'
        },
        {
            id: 'price-alerts',
            icon: '🔔',
            title: 'Price Alerts',
            description: 'Set custom price notifications',
            url: '/#price-alerts'
        },
        {
            id: 'watchlist',
            icon: '⭐',
            title: 'Watchlist',
            description: 'Track your favorite coins',
            url: '/#watchlist'
        },
        {
            id: 'community-vote',
            icon: '🗳️',
            title: 'Community Vote',
            description: 'Join daily voting',
            url: '/#community-vote'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tools.map(tool => (
                <a
                    key={tool.id}
                    href={tool.url.toLowerCase()}
                    className="bg-gray-700/30 p-4 rounded-lg hover:bg-gray-700/50 transition-all group cursor-pointer"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{tool.icon}</span>
                        <div>
                            <h3 className="font-bold group-hover:text-purple-400">{tool.title}</h3>
                            <p className="text-sm text-gray-400">{tool.description}</p>
                        </div>
                    </div>
                </a>
            ))}
        </div>
    );
} 