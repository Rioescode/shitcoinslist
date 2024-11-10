export default function ToolsNavigation({ currentTool }) {
    const tools = [
        { name: 'Moon Calculator', path: '/moon-calculator' },
        { name: 'Converter', path: '/converter' },
        { name: 'Compare', path: '/compare' }
    ];

    return (
        <div className="flex gap-2 overflow-x-auto pb-2">
            {tools.map((tool) => (
                <a
                    key={tool.name}
                    href={tool.path}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                        currentTool === tool.name 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'
                    }`}
                >
                    {tool.name}
                </a>
            ))}
        </div>
    );
} 