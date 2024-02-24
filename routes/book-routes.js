const express = require("express");
const router = express.Router();
// controller
const { getBooks,addBooks } = require("../controller/book-controller");

// GET all products
router.get("/",getBooks);

router.post("/add-books",addBooks);
module.exports = router;
