const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    kycType: {
        type: String,
        enum: ['bvn', 'nin'],
        required: true
    },
    kycID: {
        type: String,
        required: true,
        unique: true
    },
    dob: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    accountID: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Account', 
        default: null 
    },
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);