export default async function sitemap() {
  const baseUrl = 'https://shitcoinslist.com';

  // Tool pages
  const toolPages = [
    { url: '/tools/moon-calculator', priority: 0.8 },
    { url: '/tools/meme-battle', priority: 0.8 },
    { url: '/tools/volume-hunter', priority: 0.8 },
  ];

  const toolUrls = toolPages.map(tool => ({
    url: `${baseUrl}${tool.url}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: tool.priority,
  }));

  // Get all meme coins for dynamic routes
  const response = await fetch(`${baseUrl}/api/memecoins`);
  const { data: categorizedCoins } = await response.json();
  
  const coins = Object.values(categorizedCoins).flat();

  const coinUrls = coins.map((coin) => ({
    url: `${baseUrl}/coin/${coin.slug}`,
    lastModified: new Date(coin.last_updated),
    changeFrequency: 'hourly',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    ...toolUrls,
    ...coinUrls,
  ];
} 