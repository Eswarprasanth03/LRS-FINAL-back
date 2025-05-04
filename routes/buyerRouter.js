const express = require('express');
const router = express.Router();
const Buyer = require('../models/Buyer');

// Get buyer by ID
router.get('/get-user/:userId', async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.params.userId);
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: 'Buyer not found'
      });
    }
    res.json(buyer);
  } catch (error) {
    console.error('Error fetching buyer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch buyer data'
    });
  }
});

// Update buyer password
router.put('/update-password/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    console.log('Updating password for buyer:', userId);
    console.log('Request body:', { currentPassword: '***', newPassword: '***' });

    // Validate required fields
    if (!currentPassword || !newPassword) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Find the buyer
    const buyer = await Buyer.findById(userId);
    if (!buyer) {
      console.log('Buyer not found:', userId);
      return res.status(404).json({
        success: false,
        message: 'Buyer not found'
      });
    }

    console.log('Found buyer:', buyer.email);

    // Verify current password
    if (buyer.password !== currentPassword) {
      console.log('Current password mismatch');
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    buyer.password = newPassword;
    await buyer.save();

    console.log('Password updated successfully for buyer:', userId);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Error updating buyer password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update password: ' + error.message
    });
  }
});

module.exports = router; 