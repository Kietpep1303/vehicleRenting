const Otp = require('../../models/otp');
const { User } = require('../../models/user');

const { hashPassword } = require('../../utils/hashPassword');
const { checkPasswordStrength } = require('../../utils/checkPasswordStrength');
const { sendEmail } = require('../../utils/sendEmail');
const { errorHandler } = require('../../utils/errorHandler');

// Request new OTP
exports.requestOTP = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if the email exists
        const existingEmail = await User.findUserByEmail(email);
        if (!existingEmail) {
            return res.status(400).json({ message: 'Email not found' });
        }

        // Check if the OTP exists
        const existingOtp = await Otp.findValidOTP(email);
        if (existingOtp === 'OTP has expired') {
            await Otp.deleteOTP(email);
        }

        // If the OTP is not created, create a new OTP
        if (existingOtp === 'OTP not found') {
            const otp = new Otp(email);
            const newOtp = await otp.createOtp();
            await sendEmail(
            email,
            'OTP Verification',
            `Your OTP is ${newOtp.otp}`
            );
        res.status(200).json({ message: 'OTP requested successfully' });
        }
        else {
            await sendEmail(
                email,
                'OTP Verification',
                `Your OTP is ${existingOtp.otp}`
            );
            res.status(200).json({ message: 'OTP resent successfully' });
        }
    }
    catch(error) {
        return errorHandler(res, error, 'Error requesting OTP');
    }
};

// Somehow the OTP sending system is not working, so we need to resend the OTP
exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if the email exists
        const existingEmail = await User.findUserByEmail(email);
        if (!existingEmail) {
            return res.status(400).json({ message: 'Email not found' });
        }

        // Check if the OTP exists
        const existingOtp = await Otp.findValidOTP(email);
        if (existingOtp === 'OTP not found' || existingOtp === 'OTP has expired') {
            return res.status(400).json({ message: existingOtp.message });
        }
        
        // Resend the OTP to email
        await sendEmail(
            email,
            'OTP Verification',
            `[RESEND] Your OTP is ${existingEmail.otp}`
        );
        res.status(200).json({ message: 'OTP resent successfully' });
    }
    catch(error) {
        return errorHandler(res, error, 'Error resending OTP');
    }
};

// Confirm the email with OTP
exports.confirmEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Check if the email exists
        const existingEmail = await User.findUserByEmail(email);
        if (!existingEmail) {
            return res.status(400).json({ message: 'Email not found' });
        }

        // Check if the OTP exists
        const existingOtp = await Otp.findValidOTP(email);
        if (existingOtp === 'OTP not found' || existingOtp === 'OTP has expired') {
            return res.status(400).json({ message: existingOtp.message });
        }
        if (existingOtp.otp !== otp) {
            return res.status(400).json({ message: 'OTP is incorrect' });
        }

        // Update the user to level 1
        await User.updateUserLevel1(email);
        await Otp.deleteOTP(email);
        res.status(200).json({ message: 'Email confirmed successfully' });
    }
    catch(error) {
        return errorHandler(res, error, 'Error confirming email with OTP');
    }
};

// Change the password with OTP
exports.OTPChangePassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Check if the email exists
        const existingEmail = await User.findUserByEmail(email);
        if (!existingEmail) {
            return res.status(400).json({ message: 'Email not found' });
        }

        // Check if the OTP exists
        const existingOtp = await Otp.findValidOTP(email);
        if (existingOtp === 'OTP not found' || existingOtp === 'OTP has expired') {
            return res.status(400).json({ message: existingOtp.message });
        }
        if (existingOtp.otp !== otp) {
            return res.status(400).json({ message: 'OTP is incorrect' });
        }

        // Recheck the new password strength
        if (!checkPasswordStrength(password)) {
            return res.status(400).json({ message: 'New password is not met the criterias' });
        }
        // Hash the new password
        const hashedPassword = await hashPassword(newPassword);

        // Update the password
        await User.updateUserPassword(email, hashedPassword);
        await Otp.deleteOTP(email);
        res.status(200).json({ message: 'Password updated successfully' });
    }
    catch(error) {
        return errorHandler(res, error, 'Error changing password with OTP');
    }
};

