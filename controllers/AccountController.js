const router = require("express").Router();
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const userService = require("../services/UserService.js");
const _smsService = require("../services/SmsService");
const userRole = require("../models/Role.js");
const auth = require("../middlewares/auth");
dotenv.config();

router.post('/login', async (req, res) => {
    var loginResult = userService.authenticate(req.body.username, req.body.password);
    if(loginResult == -1) 
        return res.status(200).json({status: 404, message: "Username or password is invalid."});
    if(loginResult == 0) 
        return res.status(200).json({status: 403, message: "You do not have permission."});
    var token = jwt.sign(req.body.username, process.env.ACCESS_TOKEN_SECRET);
    return res.status(200).json({status: 200, token});
})

router.post('/register', auth.isAdmin, async (req, res) => {
    var newUser = {
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        birth: req.body.birth,
        username: req.body.username,
        password: req.body.password,
        role: userRole.Admin
    }

    var isExisted = await userService.getByUserName(req.body.username);
    if (isExisted)  return res.status(400).json({status: 400, message: "User is existed"});
    var result  = await userService.create(newUser);
    if(!result) 
        return res.status(400).json(result);
    await _smsService.verifyNumber(newUser.name, newUser.phoneNumber);
    res.status(200).json(result);
});

router.delete('/', async (req, res) => {
    var id = req.body._id;
    var result = await userService.deleteUser(id);
    if(!result) res.status(404);
    return res.status(200);
})

module.exports = router;
