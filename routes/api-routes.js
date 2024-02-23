const express = require("express");
const authRoutes = require("./auth-routes");
const accountRoutes = require("./account-routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/account", accountRoutes);

module.exports = router;
