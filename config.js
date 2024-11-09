const config = {
    site: {
        name: 'ShitcoinsList',
        url: 'https://shitcoinslist.com',
        title: 'Meme Coin Universe - Real-time Meme Coin Tracker',
        description: 'Track and analyze meme coins with real-time data and tools',
    },
    api: {
        baseUrl: '/api',
        endpoints: {
            memecoins: '/memecoins',
            lead: '/lead'
        }
    },
    colors: {
        main: '#7c3aed', // Purple color from your theme
        background: '#000000',
        text: '#ffffff'
    }
};

module.exports = config; 