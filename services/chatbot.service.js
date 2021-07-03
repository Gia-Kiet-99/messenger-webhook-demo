const request = require("request");
const axios = require("axios");
const axiosAcademy = require("../configs/axios.academy");
const { response } = require("express");

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

async function markAsRead(sender_psid) {
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "sender_action": "mark_seen"
  }

  await axios({
    url: "https://graph.facebook.com/v2.6/me/messages",
    method: 'post',
    params: {
      access_token: PAGE_ACCESS_TOKEN
    },
    data: request_body
  });
}

async function displaySenderAction(sender_psid) {
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "sender_action": "typing_on"
  }

  await axios({
    url: "https://graph.facebook.com/v2.6/me/messages",
    method: 'post',
    params: {
      access_token: PAGE_ACCESS_TOKEN
    },
    data: request_body
  });
}

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
      console.log('message sent!');
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}

async function handleGetStarted(sender_psid) {
  // Send the HTTP request to the Messenger Platform
  try {
    const res = await axios.get(`https://graph.facebook.com/${sender_psid}?fields=first_name,last_name&access_token=${PAGE_ACCESS_TOKEN}`);
    if (res.status === 200) {
      return { text: `Chào em ${res.data.first_name} ${res.data.last_name}` };
    }
  } catch (error) {
    console.error(error);
  }
  return { text: "Em là ai? Chúng tôi không quen!" };
}

// Handles messages events
async function handleMessage(sender_psid, received_message) {
  await markAsRead(sender_psid);
  await displaySenderAction(sender_psid);

  let response;

  // Check if the message contains text
  if (received_message.text) {
    console.log("RECEIVED_MESSAGE: ", received_message.text);
    // Create the payload for a basic text message
    const courses = await searchCourse(received_message.text);
    const elements = courses.map(course => ({
      "title": course.courseName,
      "subtitle": course.briefDescription,
      "image_url": course.courseImage,
      "buttons": [
        {
          "type": "web_url",
          "url": "https://www.originalcoastclothing.com",
          "title": "Xem chi tiết khóa học",
          // "payload": "COURSE_DETAIL"
          "webview_height_ratio": "full"
        }
      ],
    }));

    response = (elements.length > 0) ? {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": elements
        }
      }
    } : { text: "Không tìm thấy khóa học nào" }
    console.log("RESPONSE: ", JSON.stringify(response, null, 2));

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
  await markAsRead(sender_psid);
  await displaySenderAction(sender_psid);

  let response;

  // Get the payload for the postback
  let payload = received_postback.payload;
  let arr = payload.split('-');

  switch (arr[0]) {
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
    case "COURSE_CATEGORY":
      response = await handleGetCourseCategories();
      break;
    case "COURSE_CATEGORY_DETAIL":
      console.log("RECEIVED_POSTPACK: ", JSON.stringify(received_postback, null, 2));
      response = { text: "Tính năng chưa được cài đặt" }
      break;
    default:
      response = { text: "Không hợp lệ" }
      break;
  }
  console.log("RESPONSE MESSAGE: " + response);
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}

async function searchCourse(keyword) {
  try {
    const response = await axiosAcademy({
      url: '/api/search/course',
      method: 'get',
      params: {
        keyword: keyword
      }
    });
    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    console.error(error);
  }
  return [];
}

async function getCourseCategories() {
  let categories = [];
  try {
    const response = await axiosAcademy({
      url: '/categories',
      method: 'get',
    });
    if (response.status === 200) {
      for (const key in response.data) {
        categories = categories.concat(response.data[key]);
      }
    }
  } catch (error) {
    console.error(error);
  }
  return categories;
}

async function handleGetCourseCategories() {
  const categories = await getCourseCategories();
  let elements = [];
  if (categories.length > 0) {
    elements = categories.map(category => ({
      "title": category.categoryName,
      "subtitle": category.level,
      "buttons": [
        {
          "type": "postback",
          "title": `Xem chi tiết danh mục ${category.categoryName}`,
          "payload": `COURSE_CATEGORY_DETAIL-${category._id}`
        }
      ],
    }));
  }
  return (elements.length > 0) ? {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": elements
      }
    }
  } : { text: "Không tìm thấy danh mục khóa học nào" }

}

module.exports = {
  handleGetStarted: handleGetStarted,
  callSendAPI: callSendAPI,
  handleMessage: handleMessage,
  handlePostback: handlePostback,
  displaySenderAction: displaySenderAction
}
