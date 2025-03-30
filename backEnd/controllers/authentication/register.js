const { User, UserLevel2 } = require('../../models/user');

const { errorHandler } = require('../../utils/errorHandler');
const { hashPassword } = require('../../utils/hashPassword');
const { checkPasswordStrength } = require('../../utils/checkPasswordStrength');

exports.registerLevel0 = async (req, res) => {
    try {
        const { nickname, email, password } = req.body;
        const user = new User(nickname, email, password);

        // Check if the email exists
        if (await User.findUserByEmail(email)) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        
        // Recheck the password strength
        if (!checkPasswordStrength(password)) {
            return res.status(400).json({ message: 'Password is not met the criterias' });
        }
        // Hash the password
        const hashedPassword = await hashPassword(password);
        user.password = hashedPassword;

        // Create a new user
        const newUser = await user.createUserLevel0();
        res.status(201).json({ message: 'User registered level 0 successfully', newUser });
    }
    catch(error) {
        return errorHandler(res, error, 'Error registering user');
    }
};

exports.updateToLevel2 = async (req, res) => {
    try {
        const { email, firstName, middleName, lastName, idCardNumber } = req.body;

        // Check if the user exists
        const existingUser = await User.findUserByEmail(email);
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create a UserLevel2 instance
        const userLevel2 = new UserLevel2(
            firstName,
            middleName,
            lastName,
            idCardNumber,
            existingUser.nickname,
            existingUser.email,
            existingUser.password
        );

        // Update the user information
        const updatedUser = await userLevel2.updateUserLevel2();

        res.status(200).json({ message: 'User updated to Level 2 successfully', updatedUser });
    } catch (error) {
        return errorHandler(res, error, 'Error updating user to Level 2');
    }
};