const mongoose = require("mongoose");

const callSchema = new mongoose.Schema(
    {
        callId : {
            type : String,
        },
        callerId: {
            type : String,
        },
        callerName : {
            type : String,
        },
        receiverId: {
            type : String,
        },
        receiverName : {
            type : String,
        },
        hasDetailed : {
            type : Boolean,
            default : true
        },
        receiverPic : {
            type : String,
        },
        callerPic : {
            type : String,
        },

    },
);

module.exports = mongoose.model("Call", callSchema);