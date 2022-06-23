const Account = require("../mongoose-entities/Account");
const bcrypt = require("bcrypt");
const User = require("../mongoose-entities/User");
const { isStaff } = require("../middlewares/auth");
const userRole = require("../models/Role");
const { default: mongoose } = require("mongoose");

authenticate = async (username, password, role) => {
    const existingAccount = await Account.findOne({ username: username }).exec();        
    if (!existingAccount) {
        return -1;
    } 
    const validPassword = await bcrypt.compare(password, existingAccount.password);
    if (!validPassword) {
        return -1;
    }   
    if(existingAccount.role != role) return 0;
    return 1;
}

create = async (newUser) => {
    var salt = await bcrypt.genSalt(10);
    var hashedPassword = await bcrypt.hash(newUser.password, salt);
    var newAccount = new Account({
        username: newUser.username,
        password: hashedPassword,
        role: newUser.role
    });
    await newAccount.save(async (err, data) => {
        if(err)
            return false;    
        else
        {
            var user = new User({
                name: newUser.name,
                phoneNumber: newUser.phoneNumber,
                birth: new Date(newUser.birth),
                accountId: data._id
            });   
            await user.save((err, data) => console.log(data));
        }
    });
    
    return true;
}  

getAllCustomers = async () => {
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
                role: userRole.Customer
            }
        }        
    ]);
    return customers;
}
getUserById = async (id, role) => {
    var customer = await User.aggregate([
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
                    { role: userRole.Customer },
                    { _id: mongoose.Types.ObjectId(customerId) }
                ]
            }
        }        
    ]);
    return customer[0];
}

getAllUser = async () => {
    
    return staffs
}

getStaffById = async (staffId) => {

}

getById = async (id) => {
    var user = await User.findbyId(id);
    return user;
}

getByUserName = async (userName) => {
    var account = await Account.findOne({ 'username': userName});
    return account;
}

deleteUser = async (id) => {
    var user = await User.findById(id);
    if (!user) return false;
    await User.deleteOne(user);
    await Account.findByIdAndDelete(user.accountId);
    return true;
}
module.exports = {
    authenticate, 
    create,
    getById,
    getByUserName,
    deleteUser,
    getAllCustomers
}
 