const express = require("express");
const router = express.Router();

const webhookController = require("../controllers/webhook.controller");

router.get("/", (req, res, next) => {
  res.json({
    message: "Welcome to HCMUS Online Academy webhook"
  })
});

router.get("/getProfile", webhookController.getProfile);

module.exports = router;