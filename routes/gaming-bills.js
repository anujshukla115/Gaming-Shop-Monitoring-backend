const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const GamingBill = require('../models/GamingBill');
const Device = require('../models/Device');

// Get all bills
router.get('/', auth, async (req, res) => {
    try {
        const { status } = req.query;
        const query = { user: req.userId };
        if (status) query.status = status;
        
        const bills = await GamingBill.find(query).sort({ createdAt: -1 });
        res.json({ success: true, bills });
    } catch (error) {
        console.error('Get bills error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Create bill (from ended session)
router.post('/', auth, async (req, res) => {
    try {
        const bill = new GamingBill({
            user: req.userId,
            ...req.body
        });
        await bill.save();
        res.status(201).json({ success: true, message: 'Bill created successfully', bill });
    } catch (error) {
        console.error('Create bill error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Mark bill as paid
router.patch('/:id/paid', auth, async (req, res) => {
    try {
        const bill = await GamingBill.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            { status: 'paid' },
            { new: true }
        );
        if (!bill) {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }
        res.json({ success: true, message: 'Bill marked as paid', bill });
    } catch (error) {
        console.error('Mark bill paid error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete bill
router.delete('/:id', auth, async (req, res) => {
    try {
        const bill = await GamingBill.findOneAndDelete({ _id: req.params.id, user: req.userId });
        if (!bill) {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }
        res.json({ success: true, message: 'Bill deleted successfully' });
    } catch (error) {
        console.error('Delete bill error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get analytics
router.get('/analytics', auth, async (req, res) => {
    try {
        const { days, months } = req.query;
        const now = new Date();
        
        // Daily earning for last N days
        const dailyData = [];
        const daysCount = parseInt(days) || 7;
        for (let i = daysCount - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            
            const bills = await GamingBill.find({
                user: req.userId,
                status: 'paid',
                createdAt: { $gte: start, $lt: end }
            });
            const total = bills.reduce((sum, b) => sum + b.amount, 0);
            dailyData.push({
                date: start,
                earnings: total
            });
        }
        
        // Monthly earning for last N months
        const monthlyData = [];
        const monthsCount = parseInt(months) || 6;
        for (let i = monthsCount - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const start = new Date(date.getFullYear(), date.getMonth(), 1);
            const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
            
            const bills = await GamingBill.find({
                user: req.userId,
                status: 'paid',
                createdAt: { $gte: start, $lt: end }
            });
            const total = bills.reduce((sum, b) => sum + b.amount, 0);
            monthlyData.push({
                month: start,
                earnings: total
            });
        }
        
        // Paid vs Pending stats
        const paidCount = await GamingBill.countDocuments({ user: req.userId, status: 'paid' });
        const pendingCount = await GamingBill.countDocuments({ user: req.userId, status: 'pending' });
        
        res.json({
            success: true,
            dailyEarnings: dailyData,
            monthlyEarnings: monthlyData,
            paidCount,
            pendingCount
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;