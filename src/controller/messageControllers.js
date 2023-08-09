//  NEW Code with encryption and decryption

const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const { pusher } = require("../controller/pusher/pusher");
const User = require("../models/user");
const Chat = require("../models/chatModel");
const CryptoJS = require("crypto-js");
const admin = require('firebase-admin');
const serviceAccount = require('../../notification.json');
// const word = "metatest";

var key = "12345678901234567890123456789012";
key = CryptoJS.enc.Utf8.parse(key);

var iv = "1234567890123456";
iv = CryptoJS.enc.Utf8.parse(iv);


// const pusher = new Pusher({
//   appId: "1530894",
//   key: "9c3b467c5053c8a92576",
//   secret: "2a15d3e4a18416dc9537",
//   cluster: "ap1",
//   useTLS: true
// });




//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId, messageType } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }
  //  content

  let encrypted = CryptoJS.AES.encrypt(content, key, { iv: iv });
  encrypted = encrypted.toString();

  var newMessage = {
    sender: req.user._id,
    content: encrypted,
    chat: chatId,
    messageType: messageType
  };

  try {
    var message = await Message.create(newMessage);
    message = await message.populate("sender", "name profilePic")
    message = await message.populate("chat")
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    let chat = message.chat;
    let _id = message._id;
    let createdAt = message.createdAt;
    let sender = message.sender
    let messageType = message.messageType

    let decrypted = CryptoJS.AES.decrypt(message.content, key, { iv: iv });
    decrypted = decrypted.toString(CryptoJS.enc.Utf8);
    var resMessage = {
      _id,
      sender,
      content: decrypted,
      chat,
      messageType,
      createdAt,
    };
    const notifyReciverUser = chat.users.filter(user => user._id.toString() !== req.user._id.toString());
    console.log(notifyReciverUser.length)
    if (notifyReciverUser.length === 1) {
      const userToken = await User.findOne({
        $and: [
          { fcmToken: { $exists: true } }, // Check if fcmToken field exists
          { fcmToken: { $ne: null } },// Check if fcmToken field is not null
          { _id: notifyReciverUser[0]._id }
        ]
      })
      let { fcmToken } = userToken
      // console.log(notifyReciverUser[0].name)
      // demodoctor1@gmail.com => req.user._id
      // demopatient1@gmail.com
      FcmNotify(fcmToken, content, notifyReciverUser[0].name)
    }
    if (notifyReciverUser.length > 1) {
      for (let i = 0; i < notifyReciverUser.length; i++) {
        const userToken = await User.find({
          $and: [
            { fcmToken: { $exists: true } }, // Check if fcmToken field exists
            { fcmToken: { $ne: null } },// Check if fcmToken field is not null
            { _id: notifyReciverUser[i]._id }
          ]
        })
        FcmNotify(userToken[0].fcmToken, content, notifyReciverUser[i].name)
      }
    }
    res.json(resMessage);
  } catch (error) {
    res.status(400);
    throw new Error(error.stack);
  }
});
const sendMessageBySuperAdmin = asyncHandler(async (req, res) => {
  const { content, chatId, messageType , senderId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }
  //  content

  let encrypted = CryptoJS.AES.encrypt(content, key, { iv: iv });
  encrypted = encrypted.toString();

  var newMessage = {
    sender: senderId,
    content: encrypted,
    chat: chatId,
    messageType: messageType
  };

  try {
    var message = await Message.create(newMessage);
    message = await message.populate("sender", "name profilePic")
    message = await message.populate("chat")
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    let chat = message.chat;
    let _id = message._id;
    let createdAt = message.createdAt;
    let sender = message.sender
    let messageType = message.messageType

    let decrypted = CryptoJS.AES.decrypt(message.content, key, { iv: iv });
    decrypted = decrypted.toString(CryptoJS.enc.Utf8);
    var resMessage = {
      _id,
      sender,
      content: decrypted,
      chat,
      messageType,
      createdAt,
    };
    const notifyReciverUser = chat.users.filter(user => user._id.toString() !== senderId.toString());
    console.log(notifyReciverUser.length)
    if (notifyReciverUser.length === 1) {
      const userToken = await User.findOne({
        $and: [
          { fcmToken: { $exists: true } }, // Check if fcmToken field exists
          { fcmToken: { $ne: null } },// Check if fcmToken field is not null
          { _id: notifyReciverUser[0]._id }
        ]
      })
      let { fcmToken } = userToken
      // console.log(notifyReciverUser[0].name)
      // demodoctor1@gmail.com => req.user._id
      // demopatient1@gmail.com
      FcmNotify(fcmToken, content, notifyReciverUser[0].name)
    }
    if (notifyReciverUser.length > 1) {
      for (let i = 0; i < notifyReciverUser.length; i++) {
        const userToken = await User.find({
          $and: [
            { fcmToken: { $exists: true } }, // Check if fcmToken field exists
            { fcmToken: { $ne: null } },// Check if fcmToken field is not null
            { _id: notifyReciverUser[i]._id }
          ]
        })
        FcmNotify(userToken[0].fcmToken, content, notifyReciverUser[i].name)
      }
    }
    res.json(resMessage);
  } catch (error) {
    res.status(400);
    throw new Error(error.stack);
  }
});

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    let messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name profilePic email")
      .populate("chat");

    let chatMessage = [];

    for (var i = 0; i < messages.length; i++) {
      // let content = messages[i].content;
      let chat = messages[i].chat;
      let _id = messages[i]._id;
      let createdAt = messages[i].createdAt;
      let sender = messages[i].sender
      let messageType = messages[i].messageType

      let decrypted = CryptoJS.AES.decrypt(messages[i].content, key, { iv: iv });
      decrypted = decrypted.toString(CryptoJS.enc.Utf8);
      var newMessage = {
        _id,
        sender,
        content: decrypted,
        chat,
        messageType,
        createdAt,
      };

      chatMessage.push(newMessage)

    }
    res.json(chatMessage);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { allMessages, sendMessage,sendMessageBySuperAdmin };

function FcmNotify(token, data, name) {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      messagingSenderId: '314005293340'
    });
  }
  let message = {
    notification: {
      title: `Message from ${name}`,
      body: data
    },
    token: token,
    data: {
      orderId: "353463",
      orderDate: '54236456'
    },
  };
  admin.messaging().send(message)
    .then((response) => {
      console.log('Notification sent successfully:', response);
    })
    .catch((error) => {
      console.error('Error sending notification:', error.stack);
    });
}