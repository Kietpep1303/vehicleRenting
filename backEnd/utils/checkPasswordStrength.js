function checkPasswordStrength(password) {
    // Check if the password is at least 8 characters long and contains at least one uppercase letter, one lowercase letter, and one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
        return false; // Not meet requirement
    }
    return true; // Meet requirement
}

module.exports = { checkPasswordStrength };