const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { User } = require('../../models/user');

const { errorHandler } = require('../../utils/errorHandler');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check if the email and password is correct
        const existingUser = await User.findUserByEmail(email);
        if (!existingUser || !(await bcrypt.compare(password, existingUser.password))) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check if the user is verified or not
        if(existingUser.account_level === 0) {
            return res.status(403).json({ message: 'User email is not verified yet' });
        }

        // Create a token
        const resultToken = jwt.sign({ id: existingUser.id, email: existingUser.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ message: 'Login successful', token: resultToken });
    }
    catch(error) {
        return errorHandler(res, error, 'Error logging in user');
    }
};

exports.getUserInfo = async (req, res) => {
    try {
        const email = req.user.email; // Get the email from the token

        // Check if the user exists
        const existingUser = await User.findUserByEmail(email);
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the email in the token matches the email in the database
        if(existingUser.email !== email) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        res.status(200).json({ message: 'User info fetched successfully', user: existingUser });
    }
    catch(error) {
        return errorHandler(res, error, 'Error fetching user info');
    }
};