'use strict';

// Imports dependencies and set up http server
const express = require('express');
const app = express(); // creates express http server

const Config = require("./configs/constant");

app.use(express.json());
// app.use(express.urlencoded());
// Sets server port and logs message on success

app.get("/", (req, res, next) => {
  res.json({
    message: "Welcome to webhook"
  })
});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

  // Your verify token. Should be a random string.
  // let VERIFY_TOKEN = "d5f4677de264bb38444452fa8838d56549727ff52f7847a995a1a1a62ad927c8"
    
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
  
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === Config.VERIFY_TOKEN) {
      
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});

// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {

  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {

      // Gets the message. entry.messaging is an array, but 
      // will only ever contain one message, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

app.use(function (err, req, res, next) {
  res.status(500).json({
    error_message: err.stack
  });
});

app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));