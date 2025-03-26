const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

class AuthService {
    async register(userData) {
        const { email, password, ...rest } = userData;

        // Check if email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw new Error('Email already in use');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ ...rest, email, userPassword: hashedPassword });
        return user;
    }

    async login(username, email, password) {
        const user = await User.findOne({ where: { username, email } });
        if (!user) {
            throw new Error('User not found or invalid username');
        }

        const isPasswordValid = await bcrypt.compare(password, user.userPassword);
        if (!isPasswordValid) throw new Error('Invalid password');

        const token = jwt.sign({ userId: user.userId, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return { user, token };
    }

    verifyToken(token) {
        return jwt.verify(token, process.env.JWT_SECRET);
    }
}

module.exports = new AuthService();