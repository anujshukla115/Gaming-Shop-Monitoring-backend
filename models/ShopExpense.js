const mongoose = require('mongoose');

const shopExpenseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: 0
    },
    category: {
        type: String,
        enum: ['Electricity', 'Rent', 'Maintenance', 'Internet', 'Games', 'Hardware', 'Other'],
        default: 'Other'
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    }
}, {
    timestamps: true
});

shopExpenseSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('ShopExpense', shopExpenseSchema);