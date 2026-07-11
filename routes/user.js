const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Device = require('../models/Device');
const GamingBill = require('../models/GamingBill');
const ShopExpense = require('../models/ShopExpense');

// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, monthlyIncome, currency, theme } = req.body;
        
        const updateData = {};
        if (name) updateData.name = name;
        if (monthlyIncome !== undefined) updateData.monthlyIncome = monthlyIncome;
        if (currency) updateData.currency = currency;
        if (theme) updateData.theme = theme;
        
        const user = await User.findByIdAndUpdate(
            req.userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                monthlyIncome: user.monthlyIncome,
                currency: user.currency,
                theme: user.theme
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Change password
router.put('/password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide current and new password' 
            });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'New password must be at least 6 characters' 
            });
        }
        
        const user = await User.findById(req.userId);
        
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false, 
                message: 'Current password is incorrect' 
            });
        }
        
        user.password = newPassword;
        await user.save();
        
        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Delete account and all associated data
router.delete('/delete', auth, async (req, res) => {
    try {
        // Delete all associated data
        await Device.deleteMany({ user: req.userId });
        await GamingBill.deleteMany({ user: req.userId });
        await ShopExpense.deleteMany({ user: req.userId });
        
        // Delete user
        const user = await User.findByIdAndDelete(req.userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        res.json({
            success: true,
            message: 'Account and all associated data deleted successfully'
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// Get user statistics
router.get('/stats', auth, async (req, res) => {
    try {
        const deviceCount = await Device.countDocuments({ user: req.userId });
        const billCount = await GamingBill.countDocuments({ user: req.userId });
        const pendingBillCount = await GamingBill.countDocuments({ 
            user: req.userId, 
            status: 'pending' 
        });
        const paidBillCount = await GamingBill.countDocuments({ 
            user: req.userId, 
            status: 'paid' 
        });
        const expenseCount = await ShopExpense.countDocuments({ user: req.userId });
        
        // Calculate total earnings
        const bills = await GamingBill.find({ 
            user: req.userId, 
            status: 'paid' 
        });
        const totalEarnings = bills.reduce((sum, b) => sum + b.amount, 0);
        
        res.json({
            success: true,
            stats: {
                deviceCount,
                billCount,
                pendingBillCount,
                paidBillCount,
                expenseCount,
                totalEarnings
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

module.exports = router;
