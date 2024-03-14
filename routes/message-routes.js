const router = require("express").Router();
 
const { isUserAuthenticated } = require("../controller/common-controller");
const { sendMessage, getMessage } = require("../controller/message-controller");
/* 
router.post("/send-message", isUserAuthenticated, sendMessage);
router.get("/", isUserAuthenticated, getMessage); */

module.exports = router;
