'use strict';
// Imports dependencies and set up http server
const express = require('express');
const app = express(); // creates express http server
const dotenv = require("dotenv");

dotenv.config();
app.use(express.json());
// app.use(express.urlencoded());

const webhookRouter = require("./routes/webhook.route");

app.get("/", (req, res, next) => {
  res.json({
    message: "Welcome to HCMUS Online Academy webhook"
  })
});
app.use("/webhook", webhookRouter);
app.use(function (err, req, res, next) {
  res.status(500).json({
    error_message: err.stack
  });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log('webhook is listening on port ' + port));