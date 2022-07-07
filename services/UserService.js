const Account = require("../mongoose-entities/Account");
const bcrypt = require("bcrypt");
const User = require("../mongoose-entities/User");
const userRole = require("../models/Role");
const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectID;
authenticate = async (username, password, roles) => {
  const existingAccount = await Account.findOne({ username: username }).exec();
  console.log(existingAccount);
  if (existingAccount == null) {
    return -1;
  }
  const validPassword = await bcrypt.compare(
    password,
    existingAccount.password
  );
  if (!validPassword) {
    return -1;
  }
  if (roles.includes(existingAccount.role)) return 1;
  return 0;
};

create = async (newUser) => {
  var salt = await bcrypt.genSalt(10);
  var hashedPassword = await bcrypt.hash(newUser.password, salt);
  var newAccount = new Account({
    username: newUser.username,
    password: hashedPassword,
    role: newUser.role,
  });
  await newAccount.save(async (err, data) => {
    if (err) return false;
    else {
      var user = new User({
        name: newUser.name,
        phoneNumber: newUser.phoneNumber,
        birth: new Date(newUser.birth),
        accountId: data._id,
        email: newUser.email,
        rank: newUser.rank,
      });
      await user.save((err, data) => console.log(data));
    }
  });

  return true;
};

getAllCustomers = async () => {
  var customers = await User.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "accounts",
        localField: "accountId",
        foreignField: "_id",
        as: "account",
      },
    },
    { $unwind: "$account" },
    {
      $project: {
        name: 1,
        phoneNumber: 1,
        birth: 1,
        username: "$account.username",
        createdAt: 1,
        updatedAt: 1,
        role: "$account.role",
      },
    },
    {
      $match: {
        role: userRole.Customer,
      },
    },
  ]);
  return customers;
};
getUserById = async (id, role) => {
  var customer = await User.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "accounts",
        localField: "accountId",
        foreignField: "_id",
        as: "account",
      },
    },
    { $unwind: "$account" },
    {
      $project: {
        _id: 1,
        name: 1,
        phoneNumber: 1,
        birth: 1,
        username: "$account.username",
        createdAt: 1,
        updatedAt: 1,
        role: "$account.role",
      },
    },
    {
      $match: {
        $and: [
          { role: userRole.Customer },
          { _id: mongoose.Types.ObjectId(customerId) },
        ],
      },
    },
  ]);
  return customer[0];
};

getAllUser = async () => {
  return staffs;
};

getStaffById = async (staffId) => {};

getById = async (id) => {
  var user = await User.findById(id);
  return user;
};

getByUserName = async (userName) => {
  var account = await Account.findOne({ username: userName });
  return account;
};

deleteUser = async (id) => {
  var user = await User.findById(id);
  if (!user) return false;
  await User.deleteOne(user);
  await Account.findByIdAndDelete(user.accountId);
  return true;
};

getByAccountId = async (accountId) => {
  try {
    var user = await User.findOne({ accountId: ObjectId(accountId) });
    return user;
  } catch (e) {
    console.log(e);
  }
};
module.exports = {
  authenticate,
  create,
  getById,
  getByUserName,
  deleteUser,
  getByAccountId,
  getAllCustomers,
};
