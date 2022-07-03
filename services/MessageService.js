const Message = require("../mongoose-entities/Message");
const User = require("../mongoose-entities/User");
const MessageDetail = require("../mongoose-entities/MessageDetail");
const { MessageInstance } = require("twilio/lib/rest/api/v2010/account/message");
const sendMessage = async (message) => {
    var existingMessage = await Message.findOne({ userId: message.userId });
    if (existingMessage == null){
        newMessage = new Message({
            customerId: customerId,
            staffId: staffId
        });
        var newMessage = await newMessage.save();
        console.log(message);
    }
    var newMessageDetail = new MessageDetail({
        content: message.content,
        userId: message.sentByUserId,
        messageId: newMessage._id
    });
    newMessageDetail = await newMessageDetail.save();
    return newMessageDetail;
}

const getMessagesByUser = async (userId) => {
    var messages = await User.aggregate([
        {
          $lookup: {
            from: "messageId",
            localField: "userId",
            foreignField: "_id",
            as: "message",
          }
        },
        { $unwind: "$message" },
        {
            $lookup: {
              from: "messagedetails",
              localField: "messageId",
              foreignField: "$message._id",
              as: "messagedetail",
            },
        },
        { $unwind: "$messagedetail" },
        {   
            $project:{
                _id : 1,
                name : 1,
                message : "$message",
                messagedetails: "$messagedetail"
            } 
        },
        { $match: { _id: mongoose.Types.ObjectId(userId) } }
    ]);

    return messages[0];
}

const getAllMessages = async () => {
    var messages = await User.aggregate([
        {
          $lookup: {
            from: "messageId",
            localField: "userId",
            foreignField: "_id",
            as: "message",
          }
        },
        { $unwind: "$message" },
        {
            $lookup: {
              from: "messagedetails",
              localField: "messageId",
              foreignField: "$message._id",
              as: "messagedetail",
            },
        },
        { $unwind: "$messagedetail" },
        {   
            $project:{
                _id : 1,
                name : 1,
                message : "$message",
                messagedetails: "$messagedetail"
            } 
        }
    ]);

    return messages;
}

module.exports = {
    sendMessage,
    getMessagesByUser,
    getAllMessages
}