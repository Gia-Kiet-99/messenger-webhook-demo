const request = require("request");

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

const getVerify = (req, res) => {
  // Your verify token. Should be a random string.
  // let VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {

    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
}

const postVerify = async (req, res) => {
  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {
      // Gets the body of the webhook event
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        await handlePostback(sender_psid, webhook_event.postback);
      }
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
}

// Handles messages events
function handleMessage(sender_psid, received_message) {
  let response;

  // Check if the message contains text
  if (received_message.text) {
    // Create the payload for a basic text message
    response = {
      "text": `You sent the message: "${received_message.text}". Now send me an image!`
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

  console.log(JSON.stringify({ sender_psid, received_postback }));

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
      await request({
        "uri": `https://graph.facebook.com/${sender_psid}?fields=first_name,last_name`,
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "GET",
      }, (err, res, body) => {
        if (!err) {
          console.log('Get user info success')
          console.log(body);
          response = { "text": `Chào mừng ${body.first_name} ${body.last_name} đến với HCMUS - Online Academy` }
        } else {
          console.error("Unable to send message:" + err);
        }
      });
      break;
    case "SEARCH_COURSE":
      response = { "text": "Đang tìm kiếm" }
      break;
    default:
      break;
  }
  // Send the message to acknowledge the postback
  await callSendAPI(sender_psid, response);
}

function callGetInfoAPI(sender_psid) {
  request({
    "uri": `https://graph.facebook.com/${sender_psid}?fields=first_name,last_name`,
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "GET",
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
      return body;
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}
// Sends response messages via the Send API
async function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }
  // Send the HTTP request to the Messenger Platform
  await request({
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

const getProfile = (req, res) => {
  // Construct the message body
  let request_body = {
    get_started: {
      "payload": "GET_STARTED"
    },
    whitelisted_domains: ["https://shielded-wave-39018.herokuapp.com/"]
  }
  // Send the HTTP request to the Messenger Platform
  request({
    uri: "https://graph.facebook.com/v10.0/me/messenger_profile",
    qs: { "access_token": PAGE_ACCESS_TOKEN },
    method: "POST",
    json: request_body
  }, (err, res, body) => {
    console.log(body);
    if (!err) {
      console.log("set up user profile success")
    } else {
      console.error("Unable to send message:" + err);
    }
  });

  res.send("set up user profile success");
}

module.exports = {
  getVerify: getVerify,
  postVerify: postVerify,
  getProfile: getProfile
}