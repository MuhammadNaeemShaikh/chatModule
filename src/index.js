require('dotenv').config();
// const FHIRServer = require('@asymmetrik/node-fhir-server-core');
// require('@asymmetrik/node-fhir-server-core').loggers.get();
const asyncHandler = require('./lib/async-handler');
const mongoClient = require('./lib/mongo');
const globals = require('./globals');
const { RtcTokenBuilder, RtcRole } = require("agora-access-token")
const express = require('express');
const app = express();
const cors = require("cors")

// eslint-disable-next-line new-cap
var http = require('http').Server(app);
const userRoutes = require('./routes/user');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const env = require('var');
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

//Socket Logic
const socket = require('socket.io')
// const chatRoomRouter = require("./routes/chatRoom");

// const app1 = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const { mongoConfig } = require('./config');

const { CLIENT, CLIENT_DB } = require('./constants');
const signLegalDocument = require('./routes/signLegalDocumentRoute');

let main = async function () {
  // Connect to mongo and pass any options here
  let [mongoErr, client] = await asyncHandler(
    mongoClient(mongoConfig.connection)
  );

  if (mongoErr) {
    console.error(mongoErr.message);
    console.error(mongoConfig.connection);
    process.exit(1);
  }

  // Save the client in another module so I can use it in my services
  globals.set(CLIENT, client);
  globals.set(CLIENT_DB, client.db(mongoConfig.db_name));
  mongoose.set('strictQuery', false);
  mongoose.connect('mongodb+srv://neuropcm:MDEvOqeJQ5zvtThp@neuropcm01.bbxyh42.mongodb.net/?retryWrites=true&w=majority')
    // mongoose.connect('mongodb+srv://ncai:ncai@cluster0.bnkbae6.mongodb.net/?retryWrites=true&w=majority')

    .then(() => {
      console.log('Connected to DB');
    })
    .catch(() => {
      console.log('Connection Failed');
    });

  app.use(cors());
  app.options('*', cors());
  app.get('/', (req, res) => {
    res.send('Hello World!');
  });
  const APP_ID = process.env.APP_ID;
  const APP_CERTIFICATE = process.env.APP_CERTIFICATE;
  const nocahe = (req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
  }
  const generateAccessToken = (req, res) => {
    // set response header
    res.header('Acess-Control-Allow-Origin', '*');
    const channelName = req.query.channelName;
    if (!channelName) {
      return res.status(500).json({ 'error': 'channel is required' });
    }
    let uid = req.query.uid;
    if (!uid || uid == '') {
      uid = 0;
    }
    let role = RtcRole.SUBSCRIBER;
    if (req.query.role == 'publisher') {
      role = RtcRole.PUBLISHER;
    }
    let expireTime = req.query.expireTime;
    if (!expireTime || expireTime == '') {
      expireTime = 3600;
    } else {
      expireTime = parseInt(expireTime, 10);
    }
    // calculate privilege expire time
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + expireTime;
    // build the token
    const token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpireTime);
    // return the token
    return res.json({ 'token': token });
  }

  app.get('/access_token', nocahe, generateAccessToken);
  app.use('/api/chat', chatRoutes);
  app.use('/api/message', messageRoutes);
  app.use('/api/signLegalDocument', signLegalDocument);

  const io = await require('socket.io')(http, {
    cors: {
      origin: "*",
    },
  });
  global.onlineUsers = new Map();
  io.on("connection", (socket) => {
    console.log("Connected to socket.io");
    socket.on("offer", (data) => {
      console.log('***********************Offer*****************************');
      console.log("offer", data)
      socket.broadcast.emit("offer", data);
    });

    socket.on("answer", (data) => {
      console.log('***********************Answer*****************************');
      console.log("answer received", data)
      socket.broadcast.emit("answer", data);// Log statement
    });

    socket.on("bye", (data) => {
      console.log("bye event triggered", data)
      socket.broadcast.emit("bye", data);// Log statement
    });

    socket.on("out-going", (data) => {
      console.log("out-going", data);
      // console.log(candidate);
      socket.broadcast.emit("incomming-calls", data);
    });
    socket.on("declined-call", (data) => {
      console.log("declined-call");
      // console.log(candidate);
      socket.broadcast.emit("call-declined", data);
    });

    socket.on("candidate", (data) => {
      console.log("candidate", data);
      socket.broadcast.emit("candidate", data);
    });

    // Set up a listener for when a client joins a room
    socket.on("join Room", (room) => {
      console.log(`${socket.id} joined the room ${room}`);
      socket.join(room);
    });

    socket.on("leave Room", (room) => {
      socket.leave(room);
    });

    socket.on("make call", (room) => {
      socket.to(room).emit("commingCall", socket.id);
      console.log("make call", socket.id);
    });

    socket.on("call Declined", (room) => {
      socket.to(room).emit("call Declined", socket.id);
    });

    global.chatSocket = socket;
    socket.on("setup", (userId) => {

      console.log("User is connected", userId);

      socket.join(userId);
      socket.emit("connected");
    });

    socket.on('testing', (data) => {
      console.log(data);
    });
    socket.on('join chat', (room) => {
      socket.join(room);
      console.log("User Joined Room: " + room);
    });

    socket.on("leave chat", (room) => {
      socket.leave(room);
      console.log("User left Room: " + room);
    });
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (data) => {
      console.log(data);
      const senderId = data.chat._id;
      console.log('room id', senderId);
      chats = data.chat;

      io.in(data.chat._id).emit("message-recieved", data);
    });

    socket.off("setup", () => {
      console.log("USER DISCONNECTED");
      socket.leave(userId);
    });
  });
  //io.on('connection', WebSockets.connection)
  // Start our FHIR server
  //port forwarded on 3000
  // let server = FHIRServer.initialize(fhirServerConfig, app)
  // .configurePassport()
  // app.use(cors())
  // server.listen(fhirServerConfig.server.port);
  http.listen(8080, () => {
    console.log('Server listening on 8080');
  });
};

main();