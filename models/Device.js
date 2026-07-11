const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Device name is required'],
        trim: true
    },
    type: {
        type: String,
        enum: ['monitor', 'ps', 'xbox', 'pc', 'vr', 'other'],
        default: 'monitor'
    },
    ratePerHour: {
        type: Number,
        required: [true, 'Rate per hour is required'],
        min: 0
    },
    isActive: {
        type: Boolean,
        default: false
    },
    sessionStart: {
        type: Date
    },
    totalEarning: {
        type: Number,
        default: 0
    },
    totalTime: {
        type: Number,
        default: 0 // in milliseconds
    }
}, {
    timestamps: true
});

deviceSchema.index({ user: 1 });

module.exports = mongoose.model('Device', deviceSchema);