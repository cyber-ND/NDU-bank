const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['debit', 'credit'],
        required: true  
    },
    amount: {
        type: Number,
        required: true
    },
    fromAccount: {
        type: String,
        required: true
    },
    toAccount: {
        type: String,
        required: true
    },
    fromBank: {
        type: String,
    },
    toBank: {
        type: String,
    },
    description: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['SUCCESS', 'PENDING', 'FAILED'],
        default: 'PENDING'
    },
    nibssResponse: {
        type: Object,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);