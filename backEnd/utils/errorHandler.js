const errorHandler = (res, error, message = 'Server error') => {
    console.log(message, error);
    return res.status(500).json({ message, error });
};

module.exports = { errorHandler };