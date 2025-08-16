const Coupon = require('../model/coupons.model');
const AppliedCoupon = require('../model/appliedCoupons.model');
const { validationResult } = require('express-validator');

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      code,
      description,
      discountType,
      discountValue,
      maxDiscount,
      minPurchase,
      validFrom,
      expiresAt,
      maxUses,
      validForPlans
    } = req.body;

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      maxDiscount,
      minPurchase: minPurchase || 0,
      validFrom: validFrom || Date.now(),
      expiresAt,
      maxUses,
      validForPlans: validForPlans || [],
      isActive: true
    });

    await coupon.save();

    res.status(201).json({
      success: true,
      data: coupon
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
 

// @desc    Validate a coupon by code
// @route   POST /api/coupons/validate
// @access  Private
exports.validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id; // Assuming user is authenticated

    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ code, isActive: true });

    if (!coupon) {
      return res.status(404).json({ 
        success: false,
        message: 'Invalid coupon code',
        code: 'INVALID_COUPON'
      });
    }

    // Check if user has already used this coupon
    if (coupon.usedBy.some(usage => usage.user.equals(userId))) {
      return res.status(400).json({
        success: false,
        message: 'You have already used this coupon',
        code: 'COUPON_ALREADY_USED'
      });
    }

    // Return basic coupon info without marking as used
    const { usedCount, usedBy, ...couponData } = coupon.toObject();
    
    res.json({
      success: true,
      data: couponData
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Get user's active coupon
// @route   GET /api/coupons/active
// @access  Private
exports.getActiveCoupon = async (req, res) => {
  try {
    const activeCoupon = await AppliedCoupon.findOne({ 
      user: req.userId, 
      isActive: true 
    }).populate('coupon');

if (!activeCoupon) {
      return res.status(200).json({ 
        success: true, 
        data: null,
        message: 'No active coupon found'
      });
    }
    res.status(200).json({
      success: true,
      data: activeCoupon
    });
  } catch (error) {
    console.error('Error getting active coupon:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's coupon history
// @route   GET /api/coupons/history
// @access  Private
exports.getCouponHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      populate: 'coupon'
    };

    const history = await AppliedCoupon.paginate(
      { user: req.userId },
      options
    );

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error getting coupon history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Apply a coupon to user's account
// @route   POST /api/coupons/apply
// @access  Private
exports.applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.userId;
    const deviceId = req.headers.deviceid;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required'
      });
    }

    // Find the coupon
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase().trim(),
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired coupon'
      });
    }

    // Check if user already has an active coupon
    const existingCoupon = await AppliedCoupon.findOne({
      user: userId,
      isActive: true
    }).populate('coupon');

    if (existingCoupon) {
      // If same coupon is being reapplied, just return success
      if (existingCoupon.coupon.code === coupon.code) {
        return res.status(200).json({
          success: true,
          message: 'Coupon is already applied',
          data: existingCoupon
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'You already have an active coupon'
      });
    }

    // Check if coupon is valid for this user and device
    const validation = await coupon.isValid(userId, deviceId);
    if (!validation.isValid) {
      return res.status(400).json({ 
        success: false,
        message: validation.message 
      });
    }

    // Deactivate any other active coupons for this user
    await AppliedCoupon.updateMany(
      { user: userId, isActive: true },
      { $set: { isActive: false }}
    );

    // Mark coupon as used with device ID
    await coupon.markAsUsed(userId, deviceId);

    // Create new applied coupon record with device info
    const appliedCoupon = new AppliedCoupon({
      user: userId,
      coupon: coupon._id,
      deviceId: deviceId || null,
      isActive: true
    });

    await appliedCoupon.save();

    const populatedCoupon = await AppliedCoupon
      .findById(appliedCoupon._id)
      .populate('coupon')
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Coupon applied successfully',
      data: populatedCoupon
    });
  } catch (error) {
    console.error('Error applying coupon:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to apply coupon'
    });
  }
};

// @desc    Get all coupons (for admin)
// @route   GET /api/coupons
// @access  Private/Admin
exports.getAllCoupons = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = {};
    
    if (status === 'active') {
      query.isActive = true;
      query.expiresAt = { $gt: new Date() };
    } else if (status === 'expired') {
      query.$or = [
        { expiresAt: { $lt: new Date() } },
        { isActive: false }
      ];
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      select: '-usedBy'
    };

    const coupons = await Coupon.paginate(query, options);
    
    res.json({
      success: true,
      data: coupons
    });
  } catch (error) {
    console.error('Error getting coupons:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get coupon by ID
// @route   GET /api/coupons/:id
// @access  Private/Admin
exports.getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    res.json({
      success: true,
      data: coupon
    });
  } catch (error) {
    console.error('Error getting coupon:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
exports.updateCoupon = async (req, res) => {
  try {
    const updates = { ...req.body };
    
    // Don't allow updating these fields directly
    delete updates.usedCount;
    delete updates.usedBy;
    delete updates.code;
    
    // If updating validForPlans, ensure each has required fields
    if (updates.validForPlans) {
      if (!Array.isArray(updates.validForPlans) || 
          !updates.validForPlans.every(p => p.planId && p.network)) {
        return res.status(400).json({ 
          message: 'Each plan in validForPlans must have planId and network' 
        });
      }
    }
    
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    res.json({
      success: true,
      data: coupon
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Remove active coupon
// @route   DELETE /api/coupons/remove
// @access  Private
exports.removeActiveCoupon = async (req, res) => {
  try {
    const result = await AppliedCoupon.updateMany(
      { user: req.userId, isActive: true },
      { $set: { isActive: false }}
    );

    if (result.nModified === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active coupon found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon removed successfully'
    });
  } catch (error) {
    console.error('Error removing coupon:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
