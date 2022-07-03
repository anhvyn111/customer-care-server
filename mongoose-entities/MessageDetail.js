const mongoose = require("mongoose");
const referrenceValidator = require("mongoose-referrence-validator");

const MessageDetailSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    messageId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Message'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, { timestamps: true });

MessageDetailSchema.plugin(referrenceValidator);
module.exports = mongoose.model("MessageDetail", MessageDetailSchema);

