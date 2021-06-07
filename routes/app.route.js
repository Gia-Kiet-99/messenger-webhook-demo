const express = require("express");
const router = express.Router();

const appController = require("../controllers/app.controller");

// home
router.get("/", appController.getHome);

// Adds support for GET requests to our webhook
router.get("/webhook", appController.getVerify);

// Creates the endpoint for our webhook 
router.post("/webhook", appController.postVerify);

module.exports = router;