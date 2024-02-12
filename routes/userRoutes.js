const express = require("express");

const router = express.Router();

router.get("/add-user", (req, res) => {
  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .json({ username: "Test3", password: "Test#1234" });
});

module.exports = router;
