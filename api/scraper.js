const connectToDatabase = require('../lib/connectToDatabase');
const firstScrap = require('../lib/firstScrap');

module.exports = async (req, res) => {
  await connectToDatabase();
  await firstScrap();
  res.status(200).send("Scraping completed");
};