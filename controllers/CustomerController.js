const router = require("express").Router();
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const userService = require("../services/UserService.js");
const userRole = require("../models/Role.js");
const customerRank = require("../models/Rank.js");
const auth = require("../middlewares/auth.js");

dotenv.config();

router.post("/login", async (req, res) => {
  var loginResult = await userService.authenticate(
    req.body.username,
    req.body.password,
    [userRole.Customer]
  );
  if (loginResult == -1)
    return res
      .status(200)
      .json({ status: 404, message: "Username or password is invalid." });
  if (loginResult == 0)
    return res
      .status(200)
      .json({ status: 403, message: "You do not have permission." });
  var user = await userService.getByUserName(req.body.username);
  var token = jwt.sign(
    { username: req.body.username },
    process.env.ACCESS_TOKEN_SECRET
  );
  return res.status(200).json({
    status: 200,
    user: { username: user.username, role: user.role },
    token,
  });
});

router.get('/', auth.isAdmin, async (req, res) => {
    var customers = await userService.getAllUsers(userRole.Customer);
    return res.status(200).json(customers);
})

router.get('/:id', auth.isAdmin, async (req, res) => {
    var id = req.params.id;
    console.log(req.role);
    if(req.role == userRole.Customer &&  id != req.user._id) {
        return res.status(403).json("You do not have permission.");
    }
    var customer = await userService.getById(id);
    if (customer == null){
        return res.status(404).json("Customer not found");
    }
    return res.status(200).json(customer);
})

router.post('/birthday', auth.isStaff, async (req, res) => {
    var customers = await userService.getCustomersHasBirthDay();
    return res.status(200).json(customers);
})

router.put('/:id', auth.isUser, async (req, res) => {
    var id = req.params.id;
    var customer = await userService.getUserById(id, userRole.Customer);

    if(req.role == userRole.Customer && req.user._id != customer._id){
        res.status(403).json(`You do not have permission.`);
    }
    if (customer == null){
        res.status(404).json(`Not found the customer with id is ${id}`);
    }

    var updatedCustomer = {
        _id: id,
        name: req.body.name,
        phonerNumber: req.body.phonerNumber,
        birth: req.body.birth,
        gender: req.body.gender
    }

    var result = await userService.updateUser(updatedCustomer);
    return res.status(200).json(result);
})

router.delete('/:id', auth.isAdmin, async (req, res) => {
    var id = req.params.id;
    var customer = await userService.getUserById(id, userRole.Customer);
    console.log(customer);
    if (customer == null){
        return res.status(404).json("Customer not found");
    }
    await userService.deleteUser(id);
    return res.status(200).json(true);
})

router.post("/register", async (req, res) => {
  var newUser = {
    name: req.body.name,
    phoneNumber: req.body.phoneNumber,
    birth: req.body.birth,
    username: req.body.phoneNumber,
    password: req.body.password,
    email: req.body.email,
    role: userRole.Customer,
    rank: customerRank.None,
  };
  var existingAccount = await userService.getByUserName(req.body.phoneNumber);
  if (existingAccount != null)
    return res.status(400).json({ status: 400, message: "User is existed" });
  var result = await userService.create(newUser);
  if (!result) return res.status(400).json(result);
  res.status(200).json(result);
});

module.exports = router;
