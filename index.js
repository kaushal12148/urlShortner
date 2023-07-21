const express = require('express');
const mongoose = require('mongoose');
const shortid = require('shortid');


const app = express();


const urlSchema = new mongoose.Schema({
  shortUrl: {
    type: String,
    unique: true,
    required: true
  },
  longUrl: {
    type: String,
    required: true
  },
  expirationDate: {
    type: Date,
    default: null
  }
});

connectToMongoDB("mongodb://localhost:27017/short-url").then(() =>
  console.log("Mongodb connected")
);
const URL = mongoose.model('URL', urlSchema);

app.use(express.json());


app.post('/shorten', async (req, res) => {
  try {
    const { destinationUrl } = req.body;
    
  
    const shortUrl = shortid.generate();
    

    await URL.create({ shortUrl, longUrl: destinationUrl });
 
    res.json({ shortUrl: `http://localhost:3000/${urlCode}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/update', async (req, res) => {
  try {
    const { shortUrl, destinationUrl } = req.body;
    

    await URL.findOneAndUpdate({ shortUrl }, { longUrl: destinationUrl });
    
  
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/:shortUrl', async (req, res) => {
  try {
    const { shortUrl } = req.params;
    
    
    const url = await URL.findOne({ shortUrl });
    
    if (!url) {
      return res.status(404).json({ error: 'Short URL not found' });
    }
    
    
    if (url.expirationDate && url.expirationDate < new Date()) {
      return res.status(410).json({ error: 'Short URL has expired' });
    }
    

    res.redirect(url.longUrl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/update-expiry', async (req, res) => {
  try {
    const { shortUrl, daysToAdd } = req.body;
    
    
    await URL.findOneAndUpdate(
      { shortUrl },
      { $set: { expirationDate: new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000) } }
    );
    
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
