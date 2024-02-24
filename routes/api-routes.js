const express = require("express");
const authRoutes = require("./auth-routes");
const accountRoutes = require("./account-routes");
const productRoutes = require("./book-routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/account", accountRoutes);
router.use("/book", productRoutes);

module.exports = router;
