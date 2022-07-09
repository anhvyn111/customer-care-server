const Account = require("../mongoose-entities/Account");
const bcrypt = require("bcrypt");
const User = require("../mongoose-entities/User");
const userRole = require("../models/Role");
const mongoose = require("mongoose");

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

getAllUsers = async (userRole) => {
    var customers = await User.aggregate([
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: "accounts",
            localField: "accountId",
            foreignField: "_id",
            as: "account",
          }
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
                role : "$account.role"
            }
        },
        { 
            $match: {
                role: userRole
            }
        }        
    ]);
    return customers;
}

getCustomersHasBirthDay = async () => {
    var birthCustomers = [];
    var now = new Date();
    var customers = await getAllUsers(userRole.Customer);

    customers.forEach(c => {
        console.log(month, day);
        if ( now.getDate() == day && now.getMonth() == month){
            birthCustomers.push(c);
        }
    });
    return birthCustomers;
}

getUserById = async (id, role) => {
    var user = await User.aggregate([
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: "accounts",
            localField: "accountId",
            foreignField: "_id",
            as: "account",
          }
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
                role : "$account.role"
            }
        },
        { 
            $match: {
                $and: [
                    { role: role },
                    { _id: mongoose.Types.ObjectId(id) }
                ]
            }
        }        
    ]);
    return user[0];
}

getById = async (id) => {
  var user = await User.findById(id);
  return user;
};

getByUserName = async (userName) => {
  var account = await Account.findOne({ username: userName });
  return account;
};

updateUser = async (user) => {
    var result = await User.findByIdAndUpdate(user._id, 
        { 
            name: user.name,
            birth: user.birth,
            gender: user.gender
        });
    return result;
}

deleteUser = async (id) => {
    var user = await User.findById(id);
    await User.findByIdAndDelete(id);
    await Account.findByIdAndDelete(user.accountId);
}

module.exports = {
    authenticate, 
    create,
    getById,
    getUserById,
    getByUserName,
    deleteUser,
    getAllUsers,
    getCustomersHasBirthDay,
    updateUser
}