// server.js (Backend)
const express = require('express');
const mongoose = require('mongoose');
const cors = require ('cors');
const PreviousMatch = require('./models/matches');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const port = 5000;

app.use(cors());  // To allow cross-origin requests
app.use(express.json());  // To parse JSON bodies

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

async function server () {
// Endpoint to fetch data
app.get('/matches', async (req, res) => {
  try {
    const items = await PreviousMatch.find();  // Using Mongoose to fetch data
    res.json({items});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/match/:id/:title', async (req, res) => {
    try {
      const { id, title } = req.params;  // Get the 'id' and 'title' from the URL
      const item = await PreviousMatch.findOne({ _id: id, 'matches.title': title }); // Find the item by id and match title
  
      if (!item) {
        return res.status(404).json({ message: 'No item found with the given id or match title' });
      }
  
      // Find the specific match within the 'matches' array
      const match = item.matches.find(m => m.title === title);
  
      if (match) {
        res.json(match);
        console.log("GET /")  // Return the specific match
      } else {
        res.status(404).json({ message: 'No match found with that title' });
        console.log("GET failed")
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
}

module.exports = server