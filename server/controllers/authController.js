const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, nickname, country, currency_symbol, mobile, googleId, statsFrequency } = req.body;

        if (!name || !email || (!password && !googleId)) {
            return res.status(400).json({ message: 'Please add all required fields' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password if provided
        let hashedPassword = null;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            nickname,
            country,
            currency_symbol,
            mobile,
            googleId,
            statsFrequency: statsFrequency || 'monthly'
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                currency_symbol: user.currency_symbol,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                country: user.country,
                currency_symbol: user.currency_symbol,
                token: generateToken(user._id),
                monthlyBudget: user.monthlyBudget,
                user_metadata: {
                    name: user.name,
                    nickname: user.nickname,
                }
            });
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    res.status(200).json(req.user);
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.nickname = req.body.nickname || user.nickname;
        user.mobile = req.body.mobile || user.mobile;
        user.currency_symbol = req.body.currency_symbol || user.currency_symbol;
        user.statsFrequency = req.body.statsFrequency || user.statsFrequency;
        user.monthlyBudget = req.body.monthlyBudget !== undefined ? req.body.monthlyBudget : user.monthlyBudget;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            currency_symbol: updatedUser.currency_symbol,
            statsFrequency: updatedUser.statsFrequency,
            monthlyBudget: updatedUser.monthlyBudget,
            token: generateToken(updatedUser._id),
            user_metadata: {
                name: updatedUser.name,
                nickname: updatedUser.nickname,
            }
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
}

// @desc    Google Login
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;

        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Check if user exists by googleId
        let user = await User.findOne({ googleId });

        if (!user) {
            // Check if user exists by email (to link account)
            user = await User.findOne({ email });

            if (user) {
                user.googleId = googleId;
                await user.save();
            } else {
                // Return flag and data for frontend to redirect to signup
                return res.json({
                    isNew: true,
                    googleData: {
                        googleId,
                        email,
                        name,
                        picture
                    }
                });
            }
        }

        res.json({
            isNew: false,
            _id: user.id,
            name: user.name,
            email: user.email,
            country: user.country,
            currency_symbol: user.currency_symbol,
            token: generateToken(user._id),
            monthlyBudget: user.monthlyBudget,
            user_metadata: {
                name: user.name,
                nickname: user.nickname,
                picture
            }
        });
    } catch (error) {
        console.error('Google Login Error:', error);
        res.status(400).json({ message: 'Google authentication failed' });
    }
};

// @desc    Delete user account
// @route   DELETE /api/auth/account
// @access  Private
const deleteUserAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(`DELETING ACCOUNT: ${userId}`);

        // Delete all transactions first
        const transactionResult = await Transaction.deleteMany({ userId });
        console.log(`Deleted ${transactionResult.deletedCount} transactions`);

        // Delete the user
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            console.log(`User ${userId} not found during deletion`);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`User ${userId} deleted successfully`);
        res.status(200).json({ message: 'Account and associated data deleted successfully' });
    } catch (error) {
        console.error('Delete Account Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    googleLogin,
    getMe,
    updateProfile,
    deleteUserAccount
};
