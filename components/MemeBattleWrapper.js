'use client';

import ComparisonTool from './ComparisonTool';

export default function MemeBattleWrapper({ data }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((meme) => (
                <div key={meme.id} className="p-4 border rounded-lg">
                    <div className="aspect-w-16 aspect-h-9">
                        <img 
                            src={meme.image} 
                            alt={meme.name}
                            className="object-cover rounded-lg"
                        />
                    </div>
                    <div className="mt-4 space-y-2">
                        {/* Meme content */}
                    </div>
                </div>
            ))}
        </div>
    );
} 