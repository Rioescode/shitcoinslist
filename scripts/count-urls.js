const fs = require('fs');
const path = require('path');

function findUrls(dir) {
    let urls = new Set();

    // Add static routes
    urls.add('/');
    urls.add('/converter');
    urls.add('/volume-hunter');
    urls.add('/moon-calculator');

    // Read memecoins data
    const memecoins = [
        { symbol: 'doge', slug: 'dogecoin' },
        { symbol: 'shib', slug: 'shiba-inu' },
        { symbol: 'pepe', slug: 'pepe' },
        // Add more if needed
    ];

    // Add dynamic routes
    memecoins.forEach(coin => {
        urls.add(`/coin/${coin.slug}`);
        urls.add(`/converter/${coin.symbol}/usd`);
        urls.add(`/moon-calculator/${coin.symbol}`);
        urls.add(`/volume-hunter/${coin.symbol}`);
    });

    console.log('\n=== URL Count Summary ===');
    console.log('------------------------');
    console.log(`Static Pages: ${4}`);
    console.log(`Coins: ${memecoins.length}`);
    console.log(`Dynamic Pages: ${memecoins.length * 4}`);
    console.log(`Total URLs: ${urls.size}`);
    console.log('------------------------\n');

    console.log('All URLs:');
    Array.from(urls).sort().forEach((url, index) => {
        console.log(`${index + 1}. ${url}`);
    });
}

findUrls('.'); 