const express = require("express");
const { createCall, endCall } = require("../controller/call_controller");
const router = express.Router();
const { protect } = require("../middleware/authChatMiddleware");


router.route("/").post(protect, createCall);
router.route("/").delete(protect, endCall);


module.exports = router;