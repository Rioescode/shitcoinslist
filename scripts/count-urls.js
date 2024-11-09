const fetch = require('node-fetch');

async function countUrls() {
    try {
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

        // Print summary in a box
        console.log('\n┌──────────────────────┐');
        console.log('│    URL SUMMARY       │');
        console.log('├──────────────────────┤');
        console.log(`│ Total Coins: ${coins.length.toString().padEnd(7)} │`);
        console.log(`│ Total URLs: ${totalUrls.toString().padEnd(8)} │`);
        console.log('└──────────────────────┘\n');

    } catch (error) {
        console.error('Error:', error);
    }
}

countUrls(); 