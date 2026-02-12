const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    nickname: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: function () {
            return !this.googleId;
        }
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    country: {
        type: String,
        default: 'USA'
    },
    currency_symbol: {
        type: String,
        default: '$'
    },
    mobile: {
        type: String
    },
    statsFrequency: {
        type: String,
        enum: ['none', 'weekly', 'monthly', '3months', '6months', 'yearly'],
        default: 'monthly'
    },
    lastReportSent: {
        type: Date,
        default: Date.now
    },
    monthlyBudget: {
        type: Number,
        default: 2000
    },
    savingsGoal: {
        type: Number,
        default: 0
    },
    savingsGoalCategory: {
        type: String,
        default: 'General'
    },
    monthlySavingsLimit: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
