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

const app = express();

dotenv.config();

mongoose.connect(
    process.env.MONGO_URL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err, client) => {
      if(err)
        console.log(err);
      else  
      console.log("Connected to MongoDB");

    }
  );

//middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.use("/api/user", accountController);
app.use("/api/appointment", appointmentController);
app.use("/api/customer", customerController);

app.listen(PORT, () => {
  console.log("server is running 5000");
});
