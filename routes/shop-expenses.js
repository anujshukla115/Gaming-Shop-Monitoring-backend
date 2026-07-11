const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ShopExpense = require('../models/ShopExpense');

// Get all shop expenses
router.get('/', auth, async (req, res) => {
    try {
        const expenses = await ShopExpense.find({ user: req.userId }).sort({ date: -1 });
        res.json({ success: true, expenses });
    } catch (error) {
        console.error('Get shop expenses error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Create shop expense
router.post('/', auth, async (req, res) => {
    try {
        const expense = new ShopExpense({
            user: req.userId,
            ...req.body
        });
        await expense.save();
        res.status(201).json({ success: true, message: 'Expense added successfully', expense });
    } catch (error) {
        console.error('Create shop expense error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete shop expense
router.delete('/:id', auth, async (req, res) => {
    try {
        const expense = await ShopExpense.findOneAndDelete({ _id: req.params.id, user: req.userId });
        if (!expense) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }
        res.json({ success: true, message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Delete shop expense error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;