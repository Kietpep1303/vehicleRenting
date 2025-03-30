const express = require('express');

const { verifyToken } = require('../controllers/authentication/token');
const { registerLevel0, updateToLevel2 } = require('../controllers/authentication/register');
const { requestOTP, resendOTP, confirmEmail, OTPChangePassword } = require('../controllers/authentication/otp');
const { login, getUserInfo } = require('../controllers/authentication/login');

const router = express.Router();

router.post('/register', registerLevel0);
router.post('/login', login);
router.post('/get-user-info', verifyToken, getUserInfo);
router.post('/update-to-level1', confirmEmail);
router.post('/update-to-level2', verifyToken, updateToLevel2);
router.post('/request-otp', requestOTP);
router.post('/resend-otp', resendOTP);
router.post('/otp-change-password', OTPChangePassword);

module.exports = router;