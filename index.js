'use strict';
// Imports dependencies and set up http server
const express = require('express');
const app = express(); // creates express http server

app.use(express.json());
// app.use(express.urlencoded());

app.use(function (err, req, res, next) {
  res.status(500).json({
    error_message: err.stack
  });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log('webhook is listening'));