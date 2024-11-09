import { staticData } from '@/utils/getData';

export default async function sitemap() {
    const baseUrl = 'https://shitcoinslist.com';
    
    // Static routes
    const staticRoutes = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/converter`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/tools/meme-battle`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/tools/moon-calculator`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/tools/usd-converter`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/tools/volume-hunter`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
    ];

    // Generate dynamic routes from static data
    const dynamicRoutes = staticData.data.memecoins.flatMap(coin => [
        {
            url: `${baseUrl}/coin/${coin.slug}`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/converter/${coin.symbol.toLowerCase()}/usd`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/moon-calculator/${coin.symbol.toLowerCase()}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/volume-hunter/${coin.symbol.toLowerCase()}`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
    ]);

    return [...staticRoutes, ...dynamicRoutes];
} 