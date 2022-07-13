const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
const PORT = process.env.PORT || 5000;

const _messageService = require("./services/MessageService");
const userRole = require("./models/Role");
//controllers
const accountController = require("./controllers/AccountController");
const appointmentController = require("./controllers/AppointmentController");
const customerController = require("./controllers/CustomerController");
const voucherController = require("./controllers/VoucherController");
const customerVoucherController = require("./controllers/CustomerVoucherController");
const messageController = require("./controllers/MessageController");
const staffController = require("./controllers/StaffController");
const appointmentTypeController = require("./controllers/AppointmentTypeController");
const socketio = require("socket.io");
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

const server = app.listen(PORT, () => {
  console.log("server is running 5000");
});

//Socket.io
const io = socketio(server);

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.token;
    await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, data) => {
      if (err) {
        res.status(401).json("You need to login");
      } else {
        const user = await _userService.getByUserName(data.username);
        socket.id = user._id;
        socket.role = user.role;
        next();
      }
    });
  } catch (err) {
    console.log(err);
  }
});

io.on("connection", (socket) => {
  console.log(`${socket.id} connected`);
  socket.on("sendMessage", ({ userId, msg }) => {
    const id = userId;
    if (socket.role == userRole.Customer){
      id = socket.id;
    }
    const messageRoom = _messageService.getMessageByUserId(socket.id);
    io.to(messageRoom).emit("newMessage", msg);
  });
  socket.on("disconnect", () => {});
});