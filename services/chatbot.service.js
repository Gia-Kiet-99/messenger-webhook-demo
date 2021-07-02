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

// Handles messages events
function handleMessage(sender_psid, received_message) {
  let response;

  // Check if the message contains text
  if (received_message.text) {
    // Create the payload for a basic text message
    response = {
      "text": `Bạn đã gửi tin nhắn: "${received_message.text}". Bây giờ hãy gửi một hình ảnh!`
    }
  } else if (received_message.attachments) {
    // Gets the URL of the message attachment
    let attachment_url = received_message.attachments[0].payload.url;
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Is this the right picture?",
            "subtitle": "Tap a button to answer.",
            "image_url": attachment_url,
            "buttons": [
              {
                "type": "postback",
                "title": "Yes!",
                "payload": "yes",
              },
              {
                "type": "postback",
                "title": "No!",
                "payload": "no",
              }
            ],
          }]
        }
      }
    }
  }
  // Sends the response message
  callSendAPI(sender_psid, response);
}

// Handles messaging_postbacks events
async function handlePostback(sender_psid, received_postback) {
  let response;

  // console.log(JSON.stringify({ sender_psid, received_postback }));

  // Get the payload for the postback
  let payload = received_postback.payload;

  switch (payload) {
    case "yes":
      response = { "text": "Thanks!" }
      break;
    case "no":
      response = { "text": "Oops, try sending another image." }
      break;
    case "GET_STARTED":
      response = await handleGetStarted(sender_psid);
      break;
    case "SEARCH_COURSE":
      response = { "text": "Đang tìm kiếm" }
      break;
    default:
      break;
  }
  console.log("RESPONSE MESSAGE: " + response);
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}


module.exports = {
  handleGetStarted: handleGetStarted,
  callSendAPI: callSendAPI,
  handleMessage: handleMessage,
  handlePostback: handlePostback
}
