const mongoose = require('mongoose');

const gamingBillSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    deviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device',
        required: true
    },
    deviceName: {
        type: String,
        required: true
    },
    deviceType: {
        type: String,
        enum: ['monitor', 'ps', 'xbox', 'pc', 'vr', 'other'],
        default: 'monitor'
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number, // in milliseconds
        required: true
    },
    durationHours: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    }
}, {
    timestamps: true
});

gamingBillSchema.index({ user: 1, status: 1 });
gamingBillSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('GamingBill', gamingBillSchema);