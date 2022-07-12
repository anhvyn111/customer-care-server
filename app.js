const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
const PORT = process.env.PORT || 5000;

//controllers
const accountController = require("./controllers/AccountController");
const appointmentController = require("./controllers/AppointmentController");
const customerController = require("./controllers/CustomerController");
const voucherController = require("./controllers/VoucherController");
const customerVoucherController = require("./controllers/CustomerVoucherController");
const messageController = require("./controllers/MessageController");
const staffController = require("./controllers/StaffController");
const appointmentTypeController = require("./controllers/AppointmentTypeController");

const app = express();

dotenv.config();

mongoose.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err, client) => {
    if (err) console.log(err);
    else console.log("Connected to MongoDB");
  }
);

//middleware
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.use("/api/user", accountController);
app.use("/api/appointment", appointmentController);
app.use("/api/customer", customerController);
app.use("/api/voucher", voucherController);
app.use("/api/customervoucher", customerVoucherController);
app.use("/api/message", messageController);
app.use("/api/staff", staffController);
app.use("/api/appointmenttype", appointmentTypeController);

app.listen(PORT, () => {
  console.log("server is running 5000");
});
