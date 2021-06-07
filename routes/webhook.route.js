const express = require("express");
const router = express.Router();

const webhookController = require("../controllers/webhook.controller");

// Adds support for GET requests to our webhook
router.get("/", webhookController.getVerify);

// Creates the endpoint for our webhook 
router.post("/", webhookController.postVerify);

module.exports = router;