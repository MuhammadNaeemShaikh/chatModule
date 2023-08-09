const Call = require('../models/call_model');
const {pusher} = require("../controller/pusher/pusher");

exports.createCall = (async (req, res) => {

    const { callId, callerId, callerName, receiverId, receiverName, hasDetailed, receiverPic, callerPic } = req.body;
    try {
        const createCall = await Call.create({
            callId,
            callerId,
            callerName,
            receiverId,
            receiverName,
            hasDetailed,
            receiverPic,
            callerPic,
        })
        pusher.trigger("testing-notification", "testing", {
            message: createCall.callerName
          });
        res.status(200).json(createCall)
    } catch (error) {
        res.status(500).json({"msg": error.message})
    }    
})


exports.endCall = (async (req, res) => {

    const { callId } = req.body;
    try {
        const endCall = await Call.deleteOne({callerId: callId});
       
        res.status(200).json({"msg": "Call has been deleted"});
    console.log("End Call Data is here", endCall);
    } catch (error) {
        res.status(500).json({"msg": error.message})
    }    
})