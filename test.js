const cryptoRandomString = require("crypto-random-string");
const axios = require("axios");
const request = require("request");

const PAGE_ACCESS_TOKEN = "EAAipH3IPQkQBANq28gre1FL5eNttWyGMIeAIZB1um6RhSW1DgCNde1nZAsTwO11V1oT8Q7mskDH0XPZAdR9NoEAUXLz7vRwsQMriJMhjjJoLNJOfUBaFZAzToVNkXnDfQoXlZA0NAA3tdEmKK5FS99e2qUQ6YYAsSZCLvN7lzmRaAXA5Dme4Elt0UKCwtu4RgL9CRJmgHjfQZDZD";
// console.log(cryptoRandomString(64));

async function handleGetStarted(sender_psid) {
  // Send the HTTP request to the Messenger Platform
  try {
    const res = await axios.get(
      `https://graph.facebook.com/${sender_psid}?fields=first_name,last_name&access_token=${PAGE_ACCESS_TOKEN}`);
    // console.log(res);
    if(res.status === 200) {
      return `Chào em ${res.data.first_name} ${res.data.last_name}`;
    }
  } catch (error) {
    console.error(error);
  }
  return "Em là ai? Chúng tôi không quen!";
}

async function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }
  console.log(request_body);
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

async function handlePostback(sender_psid, received_postback) {
  let response = "dinh gia kiet";

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

handlePostback('3697187417053979', {"title":"Get Started","payload":"GET_STARTED"});

// handleGetStarted('3697187417053979');