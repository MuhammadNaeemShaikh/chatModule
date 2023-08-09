const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/user");

const CryptoJS = require("crypto-js");

// const word = "metatest";

var key = "12345678901234567890123456789012";
key = CryptoJS.enc.Utf8.parse(key);

var iv = "1234567890123456";
iv = CryptoJS.enc.Utf8.parse(iv);
//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected


const getChatPraticeList = asyncHandler(async (req, res) => {
  const { practiceName } = req.body
  const users = await User.find({
    "practiceName": practiceName,
  }).select("-password")
  res.json({ users: users })
});
const getListOfAllPracticeName = asyncHandler(async (req, res) => {
  const practice = await User.find({
    _id: req.user._id,
  }).select("-password")
  res.json({ practiceName: practice[0].practiceName })
});
const getRoom = asyncHandler(async (req, res) => {
  const { patId, cliId } = req.body
  const room = await Chat.findOne({
    $and: [
      { users: { $elemMatch: { $eq: patId } } },
      { users: { $elemMatch: { $eq: cliId } } },
      { practiceName: "NCAI" }
    ],
  })
  if (room === null) {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      practiceName: "NCAI",
      users: [patId, cliId],
    };

    try {
      const room = await Chat.create(chatData);

      res.json({ room: room })

    }catch (error) { 
      res.json({ message: error.message })
     }
  } else {
    res.json({ room: room._id })
  }
});

const accessChatIsCns = asyncHandler(async (req, res) => {
  const { userId, practiceName } = req.body;
  // console.log(practiceName);
  //if a chat with this user id exist an return it and if chat doesnot exist create new chat
  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
      { practiceName: practiceName },
    ],
  })
    .populate("users", "-password -PatientData -questionariDignosis -medication -lastlogin -cliDetails -medicationfhirid")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  }
  else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      practiceName: practiceName,
      users: [req.user._id, userId],
    };
    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});


const fetchChatsCNS = asyncHandler(async (req, res) => {
  try {
    const { practiceName } = req.body;

    Chat.find({ $and: [{ users: { $elemMatch: { $eq: req.user._id } } }, { practiceName: practiceName }] })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: 1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        let chatMessage = [];
        let latestMessage;
        for (var i = 0; i < results.length; i++) {
          let _id = results[i]._id;

          let chatName = results[i].chatName;
          let isGroupChat = results[i].isGroupChat;
          let users = results[i].users;
          let groupAdmin = results[i].groupAdmin;
          let latestMessage1 = results[i].latestMessage;
          if (latestMessage1) {
            let messageType = latestMessage1.messageType;
            let msgId = latestMessage1._id;
            let sender = latestMessage1.sender
            let chat = latestMessage1.chat;
            let createdAt = latestMessage1.createdAt;
            let decrypted = CryptoJS.AES.decrypt(latestMessage1.content, key, { iv: iv });
            decrypted = decrypted.toString(CryptoJS.enc.Utf8);
            latestMessage = {
              messageType,
              msgId,
              sender,
              content: decrypted,
              chat,
              createdAt
            }
          }
          let createdAt1 = results[i].createdAt;
          let isCns = results[i].isCns;

          var newMessage = {
            _id,
            chatName,
            isGroupChat,
            users,
            groupAdmin,
            latestMessage,
            "createdAt": createdAt1,
            practiceName: practiceName
          };
          chatMessage.push(newMessage)
        }
        res.status(200).send({ "results": chatMessage });
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected
const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }


  // var users = JSON.parse(req.body.users);
  const practiceName = req.body.practiceName
  var users = req.body.users;

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
      practiceName: practiceName
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Protected
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
});

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Protected
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
});

// @desc    Add user to Group / Leave
// @route   PUT /api/chat/groupadd
// @access  Protected
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
});

module.exports = {
  fetchChatsCNS,
  accessChatIsCns,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  getChatPraticeList,
  getListOfAllPracticeName,getRoom
};
