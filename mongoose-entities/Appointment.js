const mongoose = require("mongoose");
const referrenceValidator = require("mongoose-referrence-validator");

const AppointmentSchema = new mongoose.Schema({
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        appointmentTypeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AppointmentType'  
        },
        date: {
            type: Date,
            required: true
        }
    },
    { timestamps: true }
);

AppointmentSchema.plugin(referrenceValidator);
module.exports = mongoose.model("Appointment", AppointmentSchema);