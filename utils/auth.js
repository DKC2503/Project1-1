const jwt = require('jsonwebtoken');

const authUtils = {
    generateOTP: () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    },

    generateToken: (user) => {
        return jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
    }
};

module.exports = authUtils;
