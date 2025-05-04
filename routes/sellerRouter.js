const express = require('express');
const router = express.Router();
const Seller = require('../models/Seller');

// Get seller by ID
router.get('/get-user/:userId', async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.userId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }
    res.json(seller);
  } catch (error) {
    console.error('Error fetching seller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seller data'
    });
  }
});

// Update seller password
router.put('/update-password/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    console.log('Updating password for seller:', userId);
    console.log('Request body:', { currentPassword: '***', newPassword: '***' });

    // Validate required fields
    if (!currentPassword || !newPassword) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Find the seller
    const seller = await Seller.findById(userId);
    if (!seller) {
      console.log('Seller not found:', userId);
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    console.log('Found seller:', seller.email);

    // Verify current password
    if (seller.password !== currentPassword) {
      console.log('Current password mismatch');
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    seller.password = newPassword;
    await seller.save();

    console.log('Password updated successfully for seller:', userId);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Error updating seller password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update password: ' + error.message
    });
  }
});

module.exports = router; 