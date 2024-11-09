'use client';

export default function ToolLink({ id, icon, title, description }) {
    const scrollToTool = () => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div 
            onClick={scrollToTool}
            className="bg-gray-700/30 p-4 rounded-lg hover:bg-gray-700/50 transition-all group cursor-pointer"
        >
            <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{icon}</span>
                <div>
                    <h3 className="font-bold group-hover:text-purple-400">{title}</h3>
                    <p className="text-sm text-gray-400">{description}</p>
                </div>
            </div>
        </div>
    );
} 