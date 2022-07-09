const jwt = require("jsonwebtoken");
const User = require("../mongoose-entities/User");
const Account = require("../mongoose-entities/Account");
const UserRole = require("../models/Role");
const _userService = require("../services/UserService.js");

const isUser = (req, res, next) => {
  const authorizationHeaders = req.headers["authorization"];
  const token = authorizationHeaders.split(" ")[1];
  if (!token) res.status(401).json("You need to login");
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, data) => {
    if (err) {
      res.status(401).json("You need to login");
    } else {
      const account = await _userService.getByUserName(data.username);
      req.user = await User.findOne({ accountId: account._id });
      req.role = account.role;
      next();
    }
  });
};

const isStaff = (req, res, next) => {
    const authorizationHeaders = req.headers['authorization'];
    const token = authorizationHeaders.split(' ')[1];
    if(!token) res.status(401).json("You need to login");
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, data) => {
        if (err)
        {
            res.status(401).json("You need to login");
        }
        else 
        {
            var account = await _userService.getByUserName(data.username);
            console.log(account);
            if (account.role == UserRole.Admin || account.role == UserRole.Staff){
                req.user = User.findOne({ accountId: account._id });
                req.role = account.role;
                next();
            }
            else{
                return res.status(403).json("You do not have permission.");
            }
        }   
    });
}

const isAdmin = (req, res, next) => {
    const authorizationHeaders = req.headers['authorization'];
    const token = authorizationHeaders.split(' ')[1];
    if(!token) res.status(401).json("You need to login");
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, data) => {
        if (err)
        {
            res.status(401).json("You need to login");
        }
        else 
        {
            var account = await _userService.getByUserName(data.username);            
            if (account.role != UserRole.Admin){
                return res.status(403).json("You do not have permission.");
            }
            req.user = User.findOne({ accountId: account._id });
            req.role = account.role;
            next();
        }   
    });
}

module.exports = { isUser, isStaff, isAdmin };
