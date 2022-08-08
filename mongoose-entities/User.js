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
    birth: {
      type: Date,
      required: true
    },
    email: {
      type: String,
    },
    rank: {
      type: String
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
