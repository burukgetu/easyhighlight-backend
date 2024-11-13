const axios = require("axios");
const cheerio = require("cheerio");
const PreviousMatch = require('../models/matches');
const sendMessage = require("./sendMessage/sendMessage");

async function thirdScraper(url, title, matches) {
  try {
    const newTitle = title + ".mp4";
    const response = await axios.get(url);
    const html = response.data;

    console.log("3rd scraping and ");
    const $ = cheerio.load(html);

    const scripts = $('script').toArray();
    for (const element of scripts) {
      const scriptContent = $(element).html();
      const settingsMatch = scriptContent.match(/var settings = (.+?);/);

      if (settingsMatch) {
        const hlsRegex = /src:\s*{\s*hls:\s*['"]([^'"]+)['"]/;
        const match = scriptContent && scriptContent.match(hlsRegex);

        if (match) {
          const hlsUrl = match[1];
          const modifiedUrl = hlsUrl.startsWith("//") ? "http:" + hlsUrl : hlsUrl;
          console.log("modified url", modifiedUrl);
          const finalUrl = modifiedUrl.split(".m3u8")[0] + ".m3u8";
          
          matches.vidSrc = modifiedUrl;

          console.log("Match to be saved", matches);
          const previousmatches = await PreviousMatch.findOne({}, 'matches');
          previousmatches.matches.push(matches);
          await previousmatches.save();

          sendMessage(matches.title, matches.keyWords, matches.leagueType);
        } else {
          console.log('HLS URL not found in the <script> tag');
        }
      }
    }
  } catch (error) {
    console.error(`Error fetching the page: ${error.message}`);
  }
}

module.exports = thirdScraper;
