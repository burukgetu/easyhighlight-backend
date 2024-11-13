const PreviousMatch = require("../models/matches");
const thirdScraper = require("./thirdScraper");
const connectToDatabase = require("./connectToDatabase"); // Assuming connectToDatabase is in utils folder

async function secondScrap(matches) {
    console.log("2nd scrap");

    // Ensure MongoDB is connected before proceeding
    await connectToDatabase();

    matches = matches.slice(0, 3); // Limit matches to first 3
    const previousmatches = await PreviousMatch.findOne({}, 'matches');
    console.log("Matches after slice", matches); 

    if (previousmatches) {
        // Only modify `matches` if previousmatches exists
        matches = matchDifference(previousmatches.matches, matches);
        console.log("Matches after difference", matches);
    }

    // Call the processMatches function with the matches array
    console.log('Matches to be processed:', matches);
    processMatches(matches);
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
        // console.log('Extracted href:', href);
    } catch (error) {
        console.error(`Error fetching HTML for title "${title}":`, error);
    }
}

module.exports = secondScrap;
