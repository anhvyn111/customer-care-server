const router = require("express").Router();
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const userService = require("../services/UserService.js");
const userRole = require("../models/Role.js");
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

router.post('/register', async (req, res) => {
    var newUser = {
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        birth: req.body.birth,
        username: req.body.phoneNumber,
        password: req.body.password,
        role: userRole.Customer
    }
    var isExisted = await userService.getByUserName(req.body.username);
    if (isExisted)  return res.status(400).json({status: 400, message: "User is existed"});
    var result  = await userService.create(newUser);
    if(!result) 
        return res.status(400).json(result);
    res.status(200).json(result);
})

router.get('/', async (req, res) => {
    var customers = await userService.getAllCustomers();
    return res.status(200).json(customers);
})

module.exports = router;