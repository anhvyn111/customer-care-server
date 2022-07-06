const router = require("express").Router();
const bcrypt = require("bcrypt");
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

router.get("/", auth.isStaff || auth.isAdmin, async (req, res) => {
  var customers = await userService.getAllCustomers();
  return res.status(200).json(customers);
});

router.get("/:id", async (req, res) => {
  var id = req.params.id;
  if (req.role == userRole.Customer && id != req.user._id) {
    return res.status(403).json("You do not have permission.");
  }
  var customer = await userService.getById(id);
  return res.status(200).json(customer);
});

module.exports = router;
