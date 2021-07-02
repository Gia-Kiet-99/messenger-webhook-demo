const express = require("express");
const router = express.Router();

const webhookController = require("../controllers/webhook.controller");

router.get("/", (req, res, next) => {
  res.render("home", { title: "Gia Kiet" })
});

// router.get("/getProfile", webhookController.getProfile);

module.exports = router;