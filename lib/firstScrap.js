const axios = require("axios");
const cheerio = require("cheerio");
const secondScrap = require("./secondScrap");

async function firstScrap() {
  const url = "https://hoofoot.com/";
  const response = await axios.get(url);
  const html = response.data;

  const $ = cheerio.load(html);
  const matches = [];

  $('#gggg a').each((index, element) => {
    const href = url + $(element).attr('href');
    const title = $(element).find('h2').text().replace(/\s+/g, '_');
    const keyWords = title.split('_v_').map(club => club.trim());
    const fileName = title + ".mp4";
    let altText = $('#cocog .info img').eq(index).attr('alt').replace(/\s+/g, '_');
    if (altText === "Champions_Laegue") altText = "Champions_League";

    matches.push({ title, url: href, keyWords, leagueType: altText, fileName });
  });

  secondScrap(matches);
}

module.exports = firstScrap;
