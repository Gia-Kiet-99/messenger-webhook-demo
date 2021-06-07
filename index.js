'use strict';
// Imports dependencies and set up http server
const express = require('express');
const app = express(); // creates express http server
const dotenv = require("dotenv");
const path = require('path');
const logger = require('morgan');

dotenv.config();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


const homeRouter = require("./routes/home.route");
const webhookRouter = require("./routes/webhook.route");

app.use("/", homeRouter);
app.use("/webhook", webhookRouter);

app.use(function (err, req, res, next) {
  res.status(500).json({
    error_message: err.stack
  });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log('webhook is listening on port ' + port));