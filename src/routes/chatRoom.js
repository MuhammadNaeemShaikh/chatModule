const express = require('express');
// controllers
// import chatRoom from '../controllers/chatRoom.js';
const chatRoom = require('../controller/chatRoom.js');

// eslint-disable-next-line new-cap
const router = express.Router();

router
  .get('/', chatRoom.getRecentConversation)
  .get('/:roomId', chatRoom.getConversationByRoomId)
  .post('/initiate', chatRoom.initiate)
  .post('/:roomId/message', chatRoom.postMessage)
  .put('/:roomId/mark-read', chatRoom.markConversationReadByRoomId)

module.exports = router;
