const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

const token = '7166158478:AAGC6mmO2_MJj1GPG2y4v1wtf6GeVdXpKJw';

const bot = new TelegramBot(token, { polling: true });

function sendVideoToChannel(videoPath, caption) {
    const channelChatId = '@easy_football_highlight';
      
      if (!fs.existsSync(videoPath)) {
        console.error('Video file does not exist.');
        return;
      }
    
      // Check file size in MB
      const stats = fs.statSync(videoPath);
      const fileSizeInMB = stats.size / (1024 * 1024);
    
      if (fileSizeInMB <= 50) {
        // If file is 50 MB or less, send directly
        bot.sendVideo(channelChatId, fs.createReadStream(videoPath), { caption })
          .then(() => {
            console.log('Video sent successfully to channel!');
          })
          .catch((err) => {
            console.error('Error sending video:', err);
          });
      } else {
        // If file is larger than 50 MB, split into 2 parts and send each
        const part1Path = 'part1.mp4';
        const part2Path = 'part2.mp4';
    
        // Get video duration first
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
          if (err) {
            console.error('Error getting video duration:', err);
            return;
          }
    
          const duration = metadata.format.duration;
          const halfDuration = duration / 2;
    
          // Split the video into two parts
          ffmpeg(videoPath)
            .outputOptions('-c copy') // Copy without re-encoding
            .seekInput(0)
            .duration(halfDuration)
            .save(part1Path)
            .on('end', () => {
              console.log('Part 1 created successfully.');
    
              // Create part 2
              ffmpeg(videoPath)
                .outputOptions('-c copy')
                .seekInput(halfDuration)
                .save(part2Path)
                .on('end', () => {
                  console.log('Part 2 created successfully.');
    
                  // Send Part 1
                  bot.sendVideo(channelChatId, fs.createReadStream(part1Path), { caption: `${caption} #Part_1 \n\n ........................................` })
                    .then(() => {
                      console.log('Part 1 sent successfully!');
    
                      // Send Part 2 after Part 1 is sent
                      bot.sendVideo(channelChatId, fs.createReadStream(part2Path), { caption: `${caption} #Part_2 \n\n .....................................` })
                        .then(() => {
                          console.log('Part 2 sent successfully!');
                          
                          // Clean up temporary files
                          fs.unlinkSync(part1Path);
                          fs.unlinkSync(part2Path);
                        })
                        .catch((err) => {
                          console.error('Error sending Part 2:', err);
                        });
                    })
                    .catch((err) => {
                      console.error('Error sending Part 1:', err);
                    });
                })
                .on('error', (err) => {
                  console.error('Error creating Part 2:', err);
                });
            })
            .on('error', (err) => {
              console.error('Error creating Part 1:', err);
            });
        });
      }
   }

// async function sendMessageToChannel(message) {
//     const channelChatId = '@test_bg_1';
//     while (true) {
//         try {
//             await bot.sendMessage(channelChatId, message);
//             console.log('Message sent successfully to channel!');
//             break; // Exit the loop on success
//         } catch (err) {
//             if (err.response && err.response.statusCode === 429) {
//                 const retryAfter = err.response.parameters.retry_after;
//                 console.error(`Rate limit exceeded. Retrying after ${retryAfter} seconds.`);
//                 await delay(retryAfter * 1000); // Convert to milliseconds
//             } else {
//                 console.error('Error sending message:', err);
//                 break; // Exit if it's a different error
//             }
//         }
//     }
// }

// // Helper function to introduce a delay
// function delay(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

module.exports = sendVideoToChannel