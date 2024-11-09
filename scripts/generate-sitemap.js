const fetch = require('node-fetch');

async function generateSitemap() {
    try {
        // Fetch coins data
        const response = await fetch('http://localhost:3005/api/memecoins');
        const { data: categorizedCoins } = await response.json();
        const coins = Object.values(categorizedCoins).flat();

        // Count URLs
        const staticPages = 3; // Home, converter main, volume hunter main
        const coinPages = coins.length;
        const converterPages = coins.length;
        const calculatorPages = coins.length;
        const volumePages = coins.length;

        const totalUrls = staticPages + coinPages + converterPages + calculatorPages + volumePages;

        // Print count
        console.log('\x1b[36m%s\x1b[0m', '\n=== URL COUNT ===');
        console.log('\x1b[33m%s\x1b[0m', `Total URLs: ${totalUrls}`);
        console.log('\x1b[36m%s\x1b[0m', '================\n');

    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', 'Error:', error);
    }
}

generateSitemap();