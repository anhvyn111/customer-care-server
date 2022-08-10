const dotenv = require("dotenv");
dotenv.config();
const twilio = require("twilio")("AC8982979f9b30ac33358d3f7b9139fdc9", "8f17e2ebb329d94edc645763fa988822");

function sendSms (number, message) {
    number = number.replace('0', '+84');
    twilio.messages.create({
        body: message,
        to: number,
        from: process.env.PHONE_NUMBER
    })
    .then(msg => console.log(msg))
    .catch(err => console.log(err));
}

function verifyNumber (name, number) {
    number = number.replace('0', '+84');
    twilio.validationRequests
    .create({friendlyName: name, phoneNumber: number})
    .then(validation_request => console.log(validation_request.friendlyName))
    .catch(err => console.log(err));
}
module.exports = { sendSms, verifyNumber };