const thirdScraper = require("./thirdScraper");

async function secondScrap(matches) {
  matches = matches.slice(0, 3);
  const previousmatches = await PreviousMatch.findOne({}, 'matches');
  
  if (previousmatches) {
    matches = matchDifference(previousmatches.matches, matches);
    console.log(matches);
  }

  async function processMatches(matches) {
    for (const match of matches) {
      const url = match.url;
      const title = match.title;
  
      try {
        await getHtml(url, title, match);
      } catch (error) {
        console.error(`Error processing match with title "${title}":`, error);
      }
    }
  }
  
  async function getHtml(url, title, match) {
    try {
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);
      const href = $('#player a').attr('href');
  
      await thirdScraper(href, title, match);
    } catch (error) {
      console.error(`Error fetching HTML for title "${title}":`, error);
    }
  }
  
  console.log('Matches to be processed', matches);
  processMatches(matches);
}

module.exports = secondScrap;
