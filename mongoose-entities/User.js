const mongoose = require("mongoose");
const referrenceValidator = require("mongoose-referrence-validator");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    gender: {
      type: Number,
      required: true,
      default: 0
    },
    birth: {
      type: Date,
    },
    email: {
      type: String,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
  },
  { timestamps: true }
);

UserSchema.plugin(referrenceValidator);
module.exports = mongoose.model("User", UserSchema);
