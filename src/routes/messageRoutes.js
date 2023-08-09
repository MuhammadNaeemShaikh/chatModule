const express = require('express');
const {
  allMessages,
  sendMessage,
  sendMessageBySuperAdmin
} = require('../controller/messageControllers');
const { protect } = require('../middleware/authChatMiddleware');
// const requireAuth= require('../middleware/requireAuth')

const router = express.Router();

router.route('/:chatId').get(protect, allMessages);
router.route('/').post(protect, sendMessage);
router.route('/send').post(sendMessageBySuperAdmin)

module.exports = router;
