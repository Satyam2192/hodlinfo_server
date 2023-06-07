const express = require('express');
const app = express();
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const PORT =process.env.BASE_URL || 3000;

// Enable CORS
app.use(cors());
 
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Define Schema and Model for storing ticker data
const tickerSchema = new mongoose.Schema({
  name: String,
  last: Number,
  buy: Number,
  sell: Number,
  volume: Number,
  base_unit: String
});

const Ticker = mongoose.model('Ticker', tickerSchema);

// Fetch data from the API and store it in the database
app.get('/api/tickers', async (req, res) => {
  try {
    const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
    const tickersData = response.data;

    // Clear the existing data in the collection
    await Ticker.deleteMany({});

    // Extract and store required data from the API response
    const tickers = Object.values(tickersData).slice(0, 10);
    for (const tickerData of tickers) {
      const ticker = new Ticker({
        name: tickerData.name,
        last: tickerData.last,
        buy: tickerData.buy,
        sell: tickerData.sell,
        volume: tickerData.volume,
        base_unit: tickerData.base_unit
      });
      await ticker.save();
    }

    res.status(200).json({ message: 'Data stored successfully' });
    console.log(req,"data stored successfully");
  } catch (error) {
    console.error('Error fetching and storing data:', error);
    console.log(req,"error")
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Retrieve stored data from the database
app.get('/api/tickers/all', async (req, res) => {
  try {
    const tickers = await Ticker.find({});
    res.status(200).json(tickers);
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Serve static files
app.use(express.static('public'));

// Start the server

app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});
