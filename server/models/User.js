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
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
