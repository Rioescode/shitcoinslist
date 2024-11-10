export function generateMetadata({ params }) {
    // Get the exact keyword from URL
    const keyword = params.keyword;

    // List of valid keywords for SEO descriptions
    const keywordDescriptions = {
        'shitcoins': 'Find and track the top shitcoins with live prices and market data.',
        'shitcoin-crypto': 'Discover trending shitcoin crypto tokens and their live prices.',
        'new-shitcoins': 'Track the newest shitcoin launches and early opportunities.',
        'best-shitcoins': 'Find the best performing shitcoins with real-time data.',
        'shitcoins-list': 'Complete list of active shitcoins with live market data.',
        'shitcoins-to-buy': 'Top shitcoins to buy with price analysis and rankings.',
        'shitcoin-trading': 'Live shitcoin trading data and market analysis.',
        'shitcoins-price': 'Real-time shitcoin prices and market movements.',
        'best-shitcoins-to-buy-in-2024': 'Discover the best shitcoins to buy in 2024. Live prices, rankings, and top opportunities.',
    };

    // Get description or use default
    const description = keywordDescriptions[keyword] || 'Live shitcoin prices and rankings updated in real-time.';

    // Use exact keyword from URL for title
    const pageTitle = keyword.replace(/-/g, ' ');

    return {
        title: pageTitle,
        description: description,
        keywords: `${keyword}, cryptocurrency, crypto, trading, prices, market cap, volume`,
        openGraph: {
            title: pageTitle,
            description: description,
            images: [
                {
                    url: '/og-shitcoins.png',
                    width: 1200,
                    height: 630,
                    alt: pageTitle,
                },
            ],
        }
    };
} 