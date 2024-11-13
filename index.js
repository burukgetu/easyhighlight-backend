const axios = require("axios")
const cheerio = require("cheerio");
const mongoose = require("mongoose");
const path = require('path');
// const beautifyHtml = require("js-beautify");
// const fs = require("fs");
const matchDifference = require('./matcher');
const PreviousMatch = require('./models/matches');
const downloadVideo = require('./m3u8Downloader');
const dotenv = require("dotenv");
const cron = require('node-cron')
// const sendMessageToChannel = require("./sendMessageToChannel");
const sendVideoToChannel = require("./sendMessageToChannel");
const server = require("./server");
const sendMessage = require("./sendMessage/sendMessage");

dotenv.config();

// const url = "https://hofoo22.fooroomtyv.com/embed/k1jVPl0pSQjwI"

async function thirdScraper(url, title, matches) {
    try {
        const newTitle = title + ".mp4"
        const response = await axios.get(url);
        const html = response.data;

        console.log("3rd scrapping and ")
        const $ = cheerio.load(html)

        // Use a for...of loop for async/await compatibility
        const scripts = $('script').toArray();
        for (const element of scripts) {
            const scriptContent = $(element).html();
            const settingsMatch = scriptContent.match(/var settings = (.+?);/);

            if (settingsMatch) {
                const hlsRegex = /src:\s*{\s*hls:\s*['"]([^'"]+)['"]/;
                const match = scriptContent && scriptContent.match(hlsRegex);

                if (match) {
                    const hlsUrl = match[1]; // The captured group containing the HLS URL
                    const modifiedUrl = hlsUrl.startsWith("//") ? "http:" + hlsUrl : hlsUrl;
                    console.log("modified url", modifiedUrl)
                    const finalUrl = modifiedUrl.split(".m3u8")[0] + ".m3u8";
                    
                    // console.log('Extracted HLS URL:', finalUrl, "\ntitle: ", newTitle);
                    matches.vidSrc = modifiedUrl

                    console.log("Match to be saved", matches)
                    const previousmatches = await PreviousMatch.findOne({}, 'matches');
                    previousmatches.matches.push(matches);
                    await previousmatches.save();

                    // sendMessage(matches.title, matches.keyWords, matches.leagueType)

                    // console.log("Match saved", previousmatches)
                    
                    // Uncomment downloadVideo if you need to download before sending message
                    // await downloadVideo(finalUrl, newTitle);

                    // Ensure sendMessageToChannel completes before moving on
                    // const videoPath = path.join(__dirname, 'downloads', newTitle);
                    // console.log("video path: ", videoPath)
                    // const caption = title + ` \n\n #${matches.keyWords[0]}    #${matches.keyWords[1]} \n\n #${matches.leagueType} \n\n`
                    // // console.log({ caption })
                    // await sendVideoToChannel(videoPath, caption);
                } else {
                    console.log('HLS URL not found in the <script> tag');
                }
            }
        }

        // const prettifiedHtml = beautifyHtml(fullHtml, {
        //     indent_size: 2, // Set indentation size
        //     wrap_line_length: 80, // Line wrap at 80 characters
        //   });
    } catch (error) {
        console.error(`Error fetching the page: ${error.message}`);
    }
}

async function secondScrap(matches) {

    
    // console.log(matches)

    // matches.forEach(match => {
    //     const url = match.url;
    //     const title = match.title;

    //     async function getHtml(url, title) {
    //         const response = await axios.get(url);
    //         const html = response.data
    //         const $ = cheerio.load(html);
    //         const href = $('#player a').attr('href');
    //         await thirdScraper(href, title);
    //         console.log('Extracted href:', href)
    //     }
    //     getHtml(url, title)
    // });

    matches = matches.slice(0,3)
    const previousmatches = await PreviousMatch.findOne({}, 'matches');
    // console.log(matches) 
    
    if (previousmatches) {
        matches = matchDifference(previousmatches.matches, matches)
        console.log(matches)
    } 
    //     await previousmatches.save();
    // console.log('Matches array updated:', previousmatches.matches);
    // } else {
        // const previousmatches = new PreviousMatch ({
        //    matches
        // })
        // await previousmatches.save();
        // console.log('Previous Matches created', previousmatches.matches);
    // }

    // const savedMatch = await previousmatches.save();
    // console.log(savedMatch)
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
    
    // Call the processMatches function with the matches array
    console.log('match to be processed',matches)
    processMatches(matches);
}

async function firstScrap() {
    const url = "https://hoofoot.com/"
    const response = await axios.get(url);
    const html = response.data;

    const $ = cheerio.load(html);
    const matches = []
    $('#gggg a').each((index, element) => {
        const href = url + $(element).attr('href');
        const title = $(element).find('h2').text().replace(/\s+/g, '_');
        const keyWords = title.split('_v_').map(club => club.trim());
        const fileName = title + ".mp4"
        var altText = $('#cocog .info img').eq(index).attr('alt').replace(/\s+/g, '_');
        if(altText === "Champions_Laegue") altText = "Champions_League"

        matches.push({title, url: href, keyWords, leagueType: altText, fileName})
        // console.log("extracted url: ", matches)
    })

    // console.log(matches)
    secondScrap(matches);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    firstScrap();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

  server();
  
// cron.schedule('* * * * *', () => {
//     const now = new Date(); // Get the current date and time
//     console.log(`Task started running at: ${now.toLocaleString()}`);
//     firstScrap()
//     console.log("Task ended");
// })
