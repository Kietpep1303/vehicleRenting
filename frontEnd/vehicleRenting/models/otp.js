const mongoose = require('mongoose');
const dotenv = require('dotenv');

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    expireTime: {
        type: String,
        required: true,
        unique: true,
    }
});
const OTPDB = mongoose.model('OTPDB', OTPSchema);

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = { OTPDB, generateOTP };