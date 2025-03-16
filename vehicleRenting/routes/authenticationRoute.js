const express = require('express');
const { register, login, changePassword, requestOTP, OTPChangePassword, resendOTP } = require('../controllers/authentication');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/change-password', changePassword);
router.post('/request-otp', requestOTP);
router.post('/change-password-otp', OTPChangePassword);
router.post('/resend-otp', resendOTP);

module.exports = router;