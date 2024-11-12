const axios = require('axios');

const botToken = '7166158478:AAGC6mmO2_MJj1GPG2y4v1wtf6GeVdXpKJw';
const channelId = '@easy_football_highlight';


async function sendMessage (title, keywords, leagueType) {
const messageText = ` ${title}.\n\n ${leagueType} \n\n ${keywords[0]} ${keywords[0]}`;

// Send the message
axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
  chat_id: channelId,
  text: messageText,
  parse_mode: 'HTML',
  reply_markup: {
    inline_keyboard: [
      [
        { text: "Watch online", url: `https://localhost:5000/match/${title}` }
      ]
    ]
  }
})
.then(response => {
  console.log('Message sent:', response.data);
})
.catch(error => {
  console.error('Error sending message:', error);
});
}

module.exports = sendMessage