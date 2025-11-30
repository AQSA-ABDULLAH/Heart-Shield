const jwt = require('jsonwebtoken');

const createToken = (user, secret, expiresIn) => {
    var newSecret;
    if (secret) {
        newSecret = user._id + process.env.JWT_SECRET_KEY;
    } else {
        newSecret = process.env.JWT_SECRET_KEY;
    }

    const token = jwt.sign({ userId: user._id }, newSecret, { expiresIn: expiresIn });
    return token;
};

const verifyToken = (token, user) => {
    const newSecret = user._id + process.env.JWT_SECRET_KEY;
    return jwt.verify(token, newSecret);
};

module.exports = { createToken, verifyToken };
