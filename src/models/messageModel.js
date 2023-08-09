const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, trim: true },
    messageType: {type: String, default: "text"},
    messageType : {type: String , default : "text"},
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // messageDate: {}
    // encryptedData: String,
    iv: String 
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;













// const express = require('express')
// const crypto = require('crypto')
// const algorithm = 'aes-256-cbc'
// const key = crypto.randomBytes(32)
// const iv = crypto.randomBytes(16)

// const app = express()
// const port = 3000
// const chats = require('./model/message')
// require('./connect/connect')

// function  encrypt  (text) {
//   let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv)
//   let encrypted = cipher.update(text)
//   encrypted = Buffer.concat([encrypted, cipher.final()])
//    const msg= { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') }
//   return msg
// //   return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') }
// }

// function decrypt (text, textt) {
//   let iv = Buffer.from(text, 'hex')
//   let encryptedText = Buffer.from(textt, 'hex')
//   let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv)
//   let decrypted = decipher.update(encryptedText)
//   decrypted = Buffer.concat([decrypted, decipher.final()])
//   return decrypted.toString()
// }

// app.get('/', async (req, res) => {
//   try {

//     // const secret = 'HammadMuneer'
//     var hw =  encrypt('HammadMuneer')

//     console.log("encrpyt ====> ",hw)
//     console.log("encrpyt iv ====> ",hw.iv)
//     console.log("encrpyt encrypteddata ====> ",hw.encryptedData)

//     const iv = hw.iv
//     const encryptedData = hw.encryptedData

//     const user = new chats({iv,encryptedData })
//     await user.save()
//     res.status(201).json({ message: 'user chat message successfuly' })
//     console.log('user chat message successfuly')

//     const getUset = await chats.findOne({ iv , encryptedData })
//     console.log('get user ===>', getUset)

//     const dataone = getUset.iv
//     const datatwo = getUset.encryptedData
//     console.log("data one ===>",dataone)
//     console.log("data two ===>",datatwo)

//     const getencrypt =  decrypt(dataone,datatwo)
//     console.log(" after decrpyt =====>" ,getencrypt)

//   } catch (err) {
//     console.log(err)
//     res.status(500).json(err)
//   }
// })

// app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`)
// })


// /////////////////////////

// const mongoose = require('mongoose')
// const userSchema = new mongoose.Schema(
    
//     {

//   encryptedData: String,
//   iv:String
// })
// module.exports = mongoose.model('msg', userSchema)