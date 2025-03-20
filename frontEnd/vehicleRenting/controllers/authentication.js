const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/users');
const { OTPDB, generateOTP } = require('../models/otp');
const { hashPassword } = require('../utils/hashPassword');
const { sendEmail } = require('../utils/sendEmail');

// Error handler
const handleError = (res, error, message = 'Server error') => {
  console.error(message, error);
  res.status(500).json({ message, error });
};

// Check if user exists by email
const findUserByEmail = async (email) => {
  return User.findOne({ email });
};

// Check if the user exists by ID card number
const findUserById = async (idCardNumber) => {
  return User.findOne({ idCardNumber });
};

// Check if OTP exists and is valid
const findValidOTP = async (email) => {
  const existingOTP = await OTPDB.findOne({ email });
  if (existingOTP && existingOTP.expireTime > Date.now()) {
    return existingOTP;
  }
  return null;
};

// Create the new account
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, idCardNumber } = req.body;

    // Check if user already exists
    const [existingEmail, existingId] = await Promise.all([
      findUserByEmail(email),
      findUserById(idCardNumber)
    ]);
    
    if (existingEmail || existingId) {
      return res.status(400).json({ message: existingEmail ? 'Email already exists' : 'ID card number already exists' });
    }
  
    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      idCardNumber,
    });
    
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    handleError(res, error, 'Error registering user');
  }
};

// Log in to the account
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // // Generate token
    // const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
    //   expiresIn: '1h',
    // });

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    handleError(res, error, 'Error logging in user');
  }
};

// Change the password
exports.changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    // Check if user exists
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check password is correct
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Wrong password' });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await User.findOneAndUpdate({ email }, { password: hashedPassword });
    res.status(200).json({ message: 'Password changed successfully' });
  }
  catch (error) {
    handleError(res, error, 'Error changing password');
  }
};

// Request new OTP
exports.requestOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the email exists
    const existingEmail = await findUserByEmail(email);
    if (!existingEmail) {
      return res.status(400).json({ message: 'Email not found' });
    }

    // Check if OTP is already created and not expired
    const existingOTP = await findValidOTP(email);
    if (existingOTP) {
      return res.status(400).json({ message: 'OTP was already generated' });
    }
    
    // Generate OTP and save to database
    const otp = generateOTP();
    const expiredTime = Date.now() + 10 * 60 * 1000; // 10 minutes
    const newOTP = new OTPDB({
      email,
      otp,
      expireTime: expiredTime,
    });
    await newOTP.save();
    await sendEmail(
      email, 
      'OTP Verification', 
      `Your OTP is ${otp}`
    );
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    handleError(res, error, 'Error requesting OTP');
  }
};

// OTP Resend
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const existingEmail = await findUserByEmail(email);
    if (!existingEmail) {
      return res.status(400).json({ message: 'Email not found' });
    }
    const existingOTP = await findValidOTP(email);
    if (existingOTP) {
      await sendEmail(
        email, 
        'OTP Verification', 
        `Your OTP is ${existingOTP.otp}`
      );
      return res.status(200).json({ message: 'OTP sent successfully' });
    }
    return res.status(400).json({ message: 'OTP not found' });
  }
  catch (error) {
    handleError(res, error, 'Error resending OTP');
  }
};
    
// OTP password change
exports.OTPChangePassword = async (req, res) => {
  try {
    const { otp, email, newPassword } = req.body;

    const existingOTP = await OTPDB.findOne({ email });
    const user = await findUserByEmail(email);
    if (!existingOTP) {
      return res.status(400).json({ message: 'Email not found' });
    }
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    if (existingOTP.otp !== otp || existingOTP.expireTime < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    handleError(res, error, 'Error changing OTP password');
  }
};