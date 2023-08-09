const express = require("express");
const {
  fetchChatsCNS,
  accessChatIsCns,
  createGroupChat,
  removeFromGroup,
  addToGroup,
  renameGroup,
getListOfAllPracticeName,
getRoom, 
} = require("../controller/chatControllers");
const { protect } = require("../middleware/authChatMiddleware");
const requireAuth = require('../middleware/requireAuth')
const router = express.Router();

// access accessChat NeuroCare Ai
router.route('/').post(protect, accessChatIsCns);

router.route('/fetch').post(protect, fetchChatsCNS);

router.route('/group').post(protect, createGroupChat);
router.route('/rename').put(protect, renameGroup);
router.route('/groupremove').put(protect, removeFromGroup);
router.route('/groupadd').put(protect, addToGroup);
router.route('/practice/list').get(protect, getListOfAllPracticeName);
router.route('/getRoom').post(getRoom);


module.exports = router;
