const jwt = require('jsonwebtoken');

const { errorHandler } = require('../../utils/errorHandler');

exports.verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use the same secret key used to sign the token
        req.user = decoded;
        // console.log('Decoded token:', req.user.email);
        next(); 
    } catch (error) {
        return errorHandler(res, error, 'Error checking token');
    }
};