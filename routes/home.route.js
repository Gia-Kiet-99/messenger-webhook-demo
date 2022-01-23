const express = require("express");
const router = express.Router();

const webhookController = require("../controllers/webhook.controller");

router.get("/", (req, res, next) => {
  res.render("home", { title: "Gia Kiet" })
});

router.get("/arduino", (req, res, next) => {
  const { key, message } = req.body;
  if (key) {
    webhookController.manualSendMessage(key, message);
  }
  res.status(204).end();
})

// router.get("/getProfile", webhookController.getProfile);

module.exports = router;
