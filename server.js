const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.static('public'));

const CMC_API_KEY = process.env.CMC_API_KEY;
const PORT = process.env.PORT || 3000;

// List of common meme coins to track
const MEME_COINS = ['DOGE', 'SHIB', 'PEPE', 'FLOKI', 'BONK'];

app.get('/api/memecoins', async (req, res) => {
    try {
        const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest', {
            headers: {
                'X-CMC_PRO_API_KEY': CMC_API_KEY
            },
            params: {
                symbol: MEME_COINS.join(','),
                convert: 'USD'
            }
        });

        const coins = Object.values(response.data.data).map(coin => ({
            name: coin.name,
            symbol: coin.symbol,
            price: coin.quote.USD.price,
            percent_change_24h: coin.quote.USD.percent_change_24h,
            market_cap: coin.quote.USD.market_cap,
            volume_24h: coin.quote.USD.volume_24h
        }));

        res.json(coins);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 