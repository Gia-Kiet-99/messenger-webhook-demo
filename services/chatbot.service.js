const request = require("request");
const axios = require("axios");

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }
  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}

async function handleGetStarted(sender_psid) {
  // Send the HTTP request to the Messenger Platform
  try {
    const res = await axios.get(`https://graph.facebook.com/${sender_psid}?fields=first_name,last_name&access_token=${PAGE_ACCESS_TOKEN}`);
    if(res.status === 200) {
      return `Chào em ${res.data.first_name} ${res.data.last_name}`;
    }
  } catch (error) {
    console.error(error);
  }
  return "Em là ai? Chúng tôi không quen!";
}

module.exports = {
  handleGetStarted: handleGetStarted,
  callSendAPI: callSendAPI
}