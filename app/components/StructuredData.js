const config = require('../../config');

export const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.site.name,
    url: config.site.url,
    description: 'Track and analyze meme coins with real-time data and tools',
    potentialAction: {
        '@type': 'SearchAction',
        target: `${config.site.url}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
    },
};

export const coinSchema = (coin) => ({
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: coin.name,
    description: `Track ${coin.name} (${coin.symbol}) price, volume, and market data`,
    url: `${config.site.url}/coin/${coin.slug}`,
    provider: {
        '@type': 'Organization',
        name: config.site.name,
        url: config.site.url,
    },
});

export const calculatorSchema = (coin) => ({
    '@context': 'https://schema.org',
    '@type': 'FinancialCalculator',
    name: `${coin.name} Profit Calculator`,
    description: `Calculate ${coin.name} (${coin.symbol}) profits and returns`,
    url: `${config.site.url}/moon-calculator/${coin.symbol.toLowerCase()}`,
    provider: {
        '@type': 'Organization',
        name: config.site.name,
        url: config.site.url,
    },
});

export default function StructuredData({ coins }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Meme Coin Universe',
    description: 'Real-time meme coin tracker with advanced analytics and tools',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1000',
    },
    featureList: [
      'Real-time price tracking',
      'Moon Calculator',
      'Meme Battle comparison tool',
      'Volume Spike Hunter',
      'Community voting',
      'Price alerts',
    ],
    about: {
      '@type': 'Thing',
      name: 'Cryptocurrency',
      description: 'Meme coins and tokens tracking platform',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}