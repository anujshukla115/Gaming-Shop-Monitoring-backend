const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Device = require('../models/Device');

// Get all devices
router.get('/', auth, async (req, res) => {
    try {
        const devices = await Device.find({ user: req.userId }).sort({ createdAt: -1 });
        res.json({ success: true, devices });
    } catch (error) {
        console.error('Get devices error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Create device
router.post('/', auth, async (req, res) => {
    try {
        const device = new Device({
            user: req.userId,
            ...req.body
        });
        await device.save();
        res.status(201).json({ success: true, message: 'Device added successfully', device });
    } catch (error) {
        console.error('Create device error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update device
router.put('/:id', auth, async (req, res) => {
    try {
        const device = await Device.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!device) {
            return res.status(404).json({ success: false, message: 'Device not found' });
        }
        res.json({ success: true, message: 'Device updated successfully', device });
    } catch (error) {
        console.error('Update device error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete device
router.delete('/:id', auth, async (req, res) => {
    try {
        const device = await Device.findOneAndDelete({ _id: req.params.id, user: req.userId });
        if (!device) {
            return res.status(404).json({ success: false, message: 'Device not found' });
        }
        res.json({ success: true, message: 'Device deleted successfully' });
    } catch (error) {
        console.error('Delete device error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;